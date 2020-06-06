kill port :sudo kill -9 `sudo lsof -t -i:5000`

####AWS ADMIN ACCOUNT ID

104547672469


## Docker

#### https://www.digitalocean.com/community/tutorials/how-to-build-a-node-js-application-with-docker

docker build -t shanwije/backpacker-api .
docker images
docker run --name backpacker-api -p 8080:5000 -d shanwije/backpacker-api


#### push docker image directly to AWS ECR

aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 104547672469.dkr.ecr.us-east-2.amazonaws.com