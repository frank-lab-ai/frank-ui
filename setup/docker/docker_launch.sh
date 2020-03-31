echo "## stopping and removing frank-ui container ..."
docker stop frank-ui
docker rm frank-ui

#echo "## undo all local changes in local repo"
cd /data/frank/web_ui
#git reset --hard
#rm -r ~/docker-apps/frank_ui/build

#echo "pull changes from git"
#git pull

echo "## creating logs directory if they do not exist"
mkdir -p /data/frank/web_ui/core/logs/nginx 

echo "## recreating frank-ui container ..."
docker run -d --name frank-ui \
  -v /data/frank/web_ui/config.js:/app/src/config.js \
  -v /data/frank/web_ui/logs/nginx:/var/log/nginx  \
  -v /data/frank/web_ui/conf.d:/etc/nginx/conf.d \
  --net franknet0 \
  --ip 172.20.0.2 \
  --restart always nkobby/frank-ui:1.0

#echo "## npm install and build"
#docker exec frank-ui bash -c 'cd /app; npm install; npm run build'

echo "## Status of frank_ui container: "
docker inspect --format="{{json .State}}" frank-ui
