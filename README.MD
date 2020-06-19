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


### s3 bucket


## s3 bucket 

(https://codeytek.com/how-to-create-a-user-and-bucket-amazon-web-services-aws/)
User name,Password,Access key ID,Secret access key,Console login link
bucket-user,,AKIARQV4G4GKWANRVM2W,/EtJJI4uVP29Jz1aEIx9koIhppKWV2+LbF08HlgE,https://104547672469.signin.aws.amazon.com/console

user ARN : arn:aws:iam::104547672469:user/bucket-user


inline polices ( iAM user )

{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListAllMyBuckets",
                "s3:PutObject",
                "s3:GetObject"
            ],
            "Resource": [
                "arn:aws:s3:::*"
            ]
        }
    ]
}

-----

bucket policy
 {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AddCannedAcl",
            "Effect": "Allow",
            "Principal": {
                "AWS": [
                    "arn:aws:iam::104547672469:user/bucket-user"
                ]
            },
            "Action": [
                "s3:PutObject",
                "s3:PutObjectAcl"
            ],
            "Resource": [
                "arn:aws:s3:::backpacker-bucket/*"
            ],
            "Condition": {
                "StringEquals": {
                    "s3:x-amz-acl": [
                        "public-read"
                    ]
                }
            }
        }
    ]
}
