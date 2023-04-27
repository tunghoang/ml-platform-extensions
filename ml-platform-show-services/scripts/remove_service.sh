NAME=`basename $1`
TYPE=$2
PORT=$3
echo $NAME $TYPE $PORT
SYSTEMD_SERVICE_NAME=ml-$TYPE-$NAME.service
SYSTEMD_SERVICE_FILE=/etc/systemd/system/$SYSTEMD_SERVICE_NAME
echo $SYSTEMD_SERVICE_FILE

sudo systemctl stop $SYSTEMD_SERVICE_NAME
sudo rm -fr $SYSTEMD_SERVICE_FILE
sudo systemctl daemon-reload

TRAEFIK_RULE_NAME=`echo $NAME | tr '.' '_'`
TRAEFIK_RULE_FILE=/opt/tljh/state/rules/$NAME.toml
echo $TRAEFIK_RULE_FILE

sudo rm -fr $TRAEFIK_RULE_FILE
