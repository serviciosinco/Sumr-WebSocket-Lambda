const AWS = require('aws-sdk');
const { isN } = require('./common');

exports.connect = async(event)=>{

    if(!isN(event)){

        var dynamodb = new AWS.DynamoDB();
        var params = {
            TableName: "dev-ws",
            Item: {
                connectionId: { S: event.requestContext.connectionId },
                allData: { S: JSON.stringify(event.requestContext.eventType) }
            }
        };

        send = async()=>{
            await dynamodb.putItem(params).promise();
        }

    }

};