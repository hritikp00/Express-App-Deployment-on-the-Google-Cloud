# Express-App-Deployment-on-the-Google-Cloud
Create an Express app with two buttons: blue and red. Deploy the app using Google Cloud Run. Log button clicks in a database of your choice and add a rate limit of 10 clicks per button per minute. Notify users when limits are reached and publish rate limit events to Google Cloud Pub/Sub.

# Express App with Rate Limiting and Google Cloud Pub/Sub

## Technologies
- Express
- Redis
- Google Cloud Pub/Sub
- Google Cloud Run
- Pulumi (for infrastructure)
- Docker

## Setup Locally
1. Clone the repository.
2. Install dependencies:
3. Install Redis locally or use a cloud instance.

npm init -y 
npm install express redis @google-cloud/pubsub

5. Run the app:
node app.js

## Deployment
To deploy the app on Google Cloud Run, use the following instructions:
1. Build and push the Docker image.

docker build -t gcr.io/YOUR_PROJECT_ID/express-app .
docker push gcr.io/YOUR_PROJECT_ID/express-app

To Test Locally

docker build -t express-app .
docker run -p 8080:8080 express-app
docker images
docker ps 
docker stop "container id" 
docker rmi -f "id"

To check the ports are in used
lsof -i :3000
kill -9 <PID>
netstat -tuln | grep :3000


2. To Deploy Image from container registry to Cloud Run using cli.
gcloud run deploy express-app \
  --image gcr.io/YOUR_PROJECT_ID/express-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

4. Deploy using Pulumi:

curl -fsSL https://get.pulumi.com | sh
pulumi version
export PATH=$PATH:$HOME/.pulumi/bin
source ~/.bashrc 
node -v
npm -v
pulumi login
pulumi up

## Public URL

You can access the deployed app here: https://express-app-846971326240.us-central1.run.app

## Rate Limiting
- Blue and Red buttons are rate-limited to 10 clicks per minute.
- Notifications are published to Google Cloud Pub/Sub when limits are reached.


