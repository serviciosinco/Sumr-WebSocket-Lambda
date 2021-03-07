const AWS = require('aws-sdk');

let send = undefined;

function onConnect(event) {
    var dynamodb = new AWS.DynamoDB();
    send = async (data) => {
        await dynamodb.putItem(data).promise();
    }
}

exports.handler = async (event) => {
    
    onConnect(event);
    
    var params = {
        TableName: "dev-ws", // Table Name
        Item: {
            connectionId: { S: event.requestContext.connectionId }, // connection ID
            allData: { S: JSON.stringify(event) }
        }
    };
    
    await send(params);
    
    var msg = 'connected';
    
    return { 
        statusCode: 200, 
        body: JSON.stringify({ msg: msg}) /*required on lambda proxy integration*/
    };
    
};