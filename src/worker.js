'use strict';

const AWS = require("aws-sdk");
const sqs = new AWS.SQS({
    region: process.env.AWS_REGION
});
const awsAccountId = process.env.AWS_ACCOUNTID;
const sqsQueueName = process.env.SQS_QUEUE_NAME;
const queueUrl = `https://sqs.${process.env.AWS_REGION}.amazonaws.com/${awsAccountId}/${sqsQueueName}`

async function sendMessagetoSQS(event, context, done) {
    const params = {
        MessageBody: "Hello World",
        QueueUrl: queueUrl
    };
    sqs.sendMessage(params, function (err, data) {
        if (err) {
            console.log('error:', 'Fail send message' + err);
            const response = {
                statusCode: 500,
                body: JSON.stringify({
                    message: 'Error'
                })
            };
            callback(null, response);
        } else {
            console.log('data:', data.MessageId);
            const response = {
                statusCode: 200,
                body: JSON.stringify({
                    message: data.MessageId
                })
            }
            callback(null, response);
        }
    })
};

module.export.sendMessagetoSQS;