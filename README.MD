kill port :sudo kill -9 `sudo lsof -t -i:5000`


## Docker

#### https://www.digitalocean.com/community/tutorials/how-to-build-a-node-js-application-with-docker

docker build -t shanwije/backpacker-api .
docker images
docker run --name backpacker-api -p 8080:5000 -d shanwije/backpacker-api