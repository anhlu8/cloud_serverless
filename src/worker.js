'use strict';

const AWS = require("aws-sdk");
const mysql = require('mysql');

const sqs = new AWS.SQS({
    region: process.env.AWS_REGION
});
const awsAccountId = process.env.AWS_ACCOUNTID;
const sqsQueueName = process.env.SQS_QUEUE_NAME;
const queueUrl = `https://sqs.${process.env.AWS_REGION}.amazonaws.com/${awsAccountId}/${sqsQueueName}`;
const giphyAPI = process.env.GIPHY_API;

const connection = mysql.createConnection({
    host: process.env.RDS_HOSTNAME,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    port: process.env.RDS_PORT,
    database: process.env.RDS_DATABASE
});

module.exports.sendMessagetoSQS =  async function(event, context, callback){
    const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${giphyAPI}&q=cat&limit=25&offset=0&rating=G&lang=en`);
    const responseJSON = await response.json();
    const params = {
        MessageBody: "this is message sent",
        QueueUrl: queueUrl,
        MessageAttributes: {
            "Data": {
                DataType: "Binary",
                BinaryValue: responseJSON
            },
        },
    };
    sqs.sendMessage(params, function (err, data) {
        if (err) {
            console.log('error:', 'Fail send message' + err);
            const response = {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Error'
                }),
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    "Access-Control-Allow-Headers": 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
                }
            };
            callback(null, response);
        } else {
            console.log('data:', data.MessageId);
            const response = {
                statusCode: 200,
                body: JSON.stringify({
                    message: data.MessageId
                }),
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    "Access-Control-Allow-Headers": 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
                }
            }
            callback(null, response);
        }
    })
};

module.export.receiveMessagefromSQS = async function(event, context, callback){

    const params = {
        MessageBody: "this is message received",
        QueueUrl: queueUrl,
        MaxNumberOfMessages: 1,
    };

    sqs.receiveMessage(params, function(err, data){
        connection.connect(function(err){
            if(err){
                console.error('Database connection failed:' + err.stack);
                return;
            }
            console.log('Connected to database');
        });

        context.callbackWaitsForEmptyEventLoop = false;
    })

    
};