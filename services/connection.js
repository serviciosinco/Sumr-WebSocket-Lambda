const AWS = require('aws-sdk');
const { isN } = require('./common');

exports.connect = async(event)=>{

    if(!isN(event)){

        var dynamodb = new AWS.DynamoDB();
        var params = {
            TableName: "dev-ws",
            Item: {
                connectionId: { S: event.requestContext.connectionId },
                allData: { S: JSON.stringify(event) }
            }
        };

        send = await dynamodb.putItem(params).promise();
        return { e:'ok' };

    }

};


exports.disconnect = async(event)=>{

    if(!isN(event)){

        var dynamodb = new AWS.DynamoDB();
        var params = {
            TableName: "dev-ws",
            Key: {
                connectionId: { S:event.requestContext.connectionId }
            }
        };

        var send = await dynamodb.deleteItem(params).promise(); console.log(send);
        //return send;

    }

};