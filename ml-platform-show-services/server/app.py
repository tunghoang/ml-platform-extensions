from flask import Flask, g
from flask_cors import CORS
import sqlite3
import os.path
import json
from shell_utils import remove_service

BASEDIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BASEDIR, 'service.db')

app = Flask(__name__, )
CORS(app)


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


@app.route("/services/<int:service_id>", methods=["DELETE"])
def delete_service(service_id):
  serviceInst = query_db('select * from services where id=?', [service_id], one=True)
  print(serviceInst)
  others = json.loads(serviceInst.get('others'))
  if remove_service(serviceInst.get('name'), serviceInst.get('type'), others.get('port')):
    db = get_db()
    db.execute('update services set deleted = 1 where id = ?', [service_id])
    db.commit()
    return query_db('select * from services where deleted != 1')
  else:
    raise Exception("Cannot remove service")


@app.route('/services')
def index():
	return query_db('select * from services where deleted != 1')


if __name__ == '__main__':
	app.run(host="0.0.0.0", port=5000)
