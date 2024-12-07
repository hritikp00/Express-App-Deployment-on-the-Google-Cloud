import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

// Replace with your actual values
const projectId = "YOUR_PROJECT_ID"; // Your Google Cloud project ID
const serviceAccountEmail = "YOUR_SERVICE_ACCOUNT@YOUR_PROJECT_ID.iam.gserviceaccount.com"; // Replace with your service account email

// Create a Cloud Run Service
const cloudRunService = new gcp.cloudrun.Service("express-app", {
    location: "us-central1",  // Set to your desired location
    template: {
        spec: {
            containers: [
                {
                    image: "gcr.io/YOUR_PROJECT_ID/express-app", // Replace with your Docker image
                    ports: [{ containerPort: 8080 }],
                },
            ],
        },
    },
});

// Assign the service account to the Cloud Run service using IAM
const serviceAccountBinding = new gcp.cloudrun.ServiceIAMMember("cloud-run-service-account-binding", {
    service: cloudRunService.name,
    role: "roles/iam.serviceAccountUser",  // This role allows Cloud Run to use the service account
    member: pulumi.interpolate`serviceAccount:${serviceAccountEmail}`,
});

// Create a Pub/Sub Topic
const pubsubTopic = new gcp.pubsub.Topic("rate-limit-topic");

// Grant the service account permission to publish to the Pub/Sub topic
const pubSubIamRole = new gcp.pubsub.TopicIAMMember("cloud-run-publisher", {
    topic: pubsubTopic.name,
    role: "roles/pubsub.publisher", // Granting the publisher role to the service account
    member: pulumi.interpolate`serviceAccount:${serviceAccountEmail}`,  // Using the specified service account
});

// Export the Cloud Run URL and Pub/Sub Topic Name
// We need to use .apply() because the URL is available only after deployment
export const url = cloudRunService.statuses[0].url.apply((url: string) => url);
export const pubSubTopicName = pubsubTopic.name;
