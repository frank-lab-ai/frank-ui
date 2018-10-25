echo "## stopping and removing frank_ui container ..."
docker stop frank_ui
docker rm frank_ui

#echo "## undo all local changes in local repo"
cd /data/frank/web_ui
#git reset --hard
#rm -r ~/docker-apps/frank_ui/build

#echo "pull changes from git"
#git pull

echo "## creating logs directory if they do not exist"
mkdir -p /data/frank/web_ui/core/logs/nginx 

echo "## recreating opine-ui container ..."
docker run -d --name frank_ui \
  -v /data/frank/web_ui/:/app \
  -v /data/frank/web_ui/logs/nginx:/var/log/nginx  \
  -v /data/frank/web_ui/docker-files/conf.d:/etc/nginx/conf.d \
  --net franknet0 \
  --ip 172.20.0.2 \
  --restart always kan/nginx-npm:1.1

#echo "## npm install and build"
#docker exec frank_ui bash -c 'cd /app; npm install; npm run build'

echo "## Status of frank_ui container: "
docker inspect --format="{{json .State}}" frank_ui
