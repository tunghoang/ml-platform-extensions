from flask import Flask, g, request, make_response, jsonify
from flask_cors import CORS
from flask_argon2 import Argon2
import sqlite3
import os.path
from operator import itemgetter

from flask_jwt_extended import (create_access_token, get_jwt_identity, jwt_required, JWTManager, set_access_cookies)

BASEDIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BASEDIR, 'service.db')

app = Flask(__name__, )

app.config["JWT_SECRET_KEY"] = "super-secret"
app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
app.config["JWT_ACCESS_COOKIE_NAME"] = "access_token"
app.config["JWT_COOKIE_CSRF_PROTECT"] = False
jwt = JWTManager(app)

argon2 = Argon2(app)
CORS(app, supports_credentials=True, origins="http://localhost:8888")


def dict_factory(cursor, row):
	d = {}
	for idx, col in enumerate(cursor.description):
		d[col[0]] = row[idx]
	return d


def get_db():
	db = getattr(g, '_database', None)
	if db is None:
		db = g._database = sqlite3.connect(DATABASE)
		db.row_factory = dict_factory
	return db


@app.teardown_appcontext
def close_connection(exception):
	db = getattr(g, '_database', None)
	if db is not None:
		db.close()


def query_db(query, args=(), one=False):
	cur = get_db().execute(query, args)
	rv = cur.fetchall()
	cur.close()
	return (rv[0] if rv else None) if one else rv


@app.route("/auth")
@jwt_required()
def auth():
	username = get_jwt_identity()
	if username is None:
		return 'Unauthorized', 401
	return 'OK'


@app.route("/auth/login", methods=["POST"])
def login():
	username, password = itemgetter("username", "password")(request.get_json())
	user = query_db("select * from users where username = ?", [username], True)
	if user is None:
		return 'User not found', 404
	if not argon2.check_password_hash(user['password'], password):
		return 'Wrong username or password', 401
	access_token = create_access_token(identity=username)
	res = make_response('OK')
	set_access_cookies(res, access_token)
	return res


@app.route("/auth/register", methods=["POST"])
def register():
	username, password = itemgetter("username", "password")(request.get_json())
	hashed_password = argon2.generate_password_hash(password)
	db = get_db()
	db.execute('insert into users (username, password) values (?, ?)', [username, hashed_password])
	db.commit()
	return 'OK'


@app.route('/services')
@jwt_required()
def index():
	username = get_jwt_identity()
	if username is None:
		return 'Unauthorized', 401
	return query_db('select * from services where deleted != 1')


@app.route("/services/<int:service_id>", methods=["DELETE"])
@jwt_required()
def delete_service(service_id):
	username = get_jwt_identity()
	if username is None:
		return 'Unauthorized', 401
	db = get_db()
	db.execute('update services set deleted = 1 where id = ?', [service_id])
	db.commit()
	return 'OK'


if __name__ == '__main__':
	app.run(debug=True)
