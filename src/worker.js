'use strict';

const AWS = require("aws-sdk");
const sqs = new AWS.SQS({
    region: process.env.AWS_REGION
});
const awsAccountId = process.env.AWS_ACCOUNTID;
const sqsQueueName = process.env.SQS_QUEUE_NAME;
const queueUrl = `https://sqs.${process.env.AWS_REGION}.amazonaws.com/${awsAccountId}/${sqsQueueName}`;
const giphyAPI = process.env.GIPHY_API;
async function sendMessagetoSQS(event, context, done) {
    const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${giphyAPI}&q=cat&limit=25&offset=0&rating=G&lang=en`);
    const responseJSON = await response.json();
    const params = {
        MessageBody: "Hello World",
        QueueUrl: queueUrl,
        MessageAttributes: {
            "Title": {
                DataType: "String",
                StringValue: "The Whistler"
            },
            "Author": {
                DataType: "String",
                StringValue: "John Grisham"
            },
            "WeeksOn": {
                DataType: "Number",
                StringValue: "6"
            }
        },
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