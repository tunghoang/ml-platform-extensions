echo "Export Service $1 - $2 - $3" > /tmp/out.txt
DBPATH=/home/jupyter-admin/ml-platform-extensions/ml-platform-show-services/server/service.db

NAME=$1
TYPE="voila"
DIR=$2
PORT=$3
OTHERS="{\"port\":$PORT}"

maxId=`sudo sqlite3 -json $DBPATH "select MAX(id) as max from services;" | jq '.[0].max'`
if [ $maxId == 'null' ]; then
  maxId=1
else
  maxId=`expr $maxId + 1`
fi
echo "--"$maxId"++"

statement="INSERT INTO services(id,name,type,others,deleted) values ($maxId, '$HOME/$NAME', '$TYPE', '$OTHERS', 0)";

echo $statement | sudo sqlite3 $DBPATH

SYSTEMD_SERVICE_NAME=ml-$TYPE-$(basename $NAME).service
BASE_URL=`basename $NAME | tr '.' '_'`

systemd_content="[Unit]
Description=ML Platform Voila service for $NAME at port $PORT

[Service]
User=$USER
WorkingDirectory=$HOME
ExecStart=/opt/tljh/user/bin/voila $HOME/$NAME --no-browser --port $PORT --base_url=/$BASE_URL/ --Voila.ip=0.0.0.0

[Install]
WantedBy=multi-user.target
"

#echo "$systemd_content" | NAME=$NAME PORT=$PORT /opt/tljh/scripts/mo > /tmp/ml-$TYPE-$(basename $NAME).service
echo "$systemd_content" > /tmp/ml-$TYPE-$(basename $NAME).service
sudo mv /tmp/$SYSTEMD_SERVICE_NAME /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl start $SYSTEMD_SERVICE_NAME

exit

SHORT_NAME=`basename $NAME | tr '.' '_'`
traefik_rule="[frontends]
  [frontends.fe_$SHORT_NAME]
  backend = 'be_$SHORT_NAME'
    [frontends.fe_$SHORT_NAME.routes.test_1]
    rule = 'PathPrefix: /$SHORT_NAME/'
[backends]
  [backends.be_$SHORT_NAME]
    [backends.be_$SHORT_NAME.servers.server1]
    url = 'http://127.0.0.1:$PORT'
    weight = 1"
echo "$traefik_rule" > /tmp/$(basename $NAME).toml 
sudo mv /tmp/$(basename $NAME).toml /opt/tljh/state/rules/
