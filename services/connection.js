const AWS = require('aws-sdk');
const { isN } = require('./common');

exports.connect = async(event)=>{

    var reponse = { status:'start' };

    if(!isN(event)){
        
        var dynamodb = new AWS.DynamoDB();
        var params = {
            TableName: 'dev-ws',
            Item: {
                connectionId: { S: event.requestContext.connectionId },
                allData: { S: JSON.stringify(event) }
            },
            ReturnValues:'ALL_OLD'
        };

        try{

            let send = await dynamodb.putItem(params).promise();
            console.log("Success");
            console.log(send);

        }catch(err){
            reponse = { status:'failed', error:err };
        }

        return reponse;

    }else{

        return reponse;

    }

};


exports.disconnect = async(event)=>{

    if(!isN(event)){

        var dynamodb = new AWS.DynamoDB();
        var params = {
            TableName: 'dev-ws',
            Key: {
                connectionId: { S:event.requestContext.connectionId }
            }
        };

        var send = await dynamodb.deleteItem(params).promise(); console.log(send);
        //return send;

    }

};