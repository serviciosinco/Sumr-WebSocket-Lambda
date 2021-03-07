const AWS = require('aws-sdk');
const { isN } = require('./common');

exports.connect = async(event)=>{

    var response = { status:'start' };

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

            if(send.Attributes.connectionId){
                response = { status:'success' };
            }

        }catch(err){

            response = { status:'failed', error:err };
        
        }

        return response;

    }else{

        return response;

    }

};


exports.disconnect = async(event)=>{

    var response = { status:'start' };

    if(!isN(event)){

        var dynamodb = new AWS.DynamoDB();
        var params = {
            TableName: 'dev-ws',
            Key: {
                connectionId: { S:event.requestContext.connectionId }
            },
            ReturnValues:'ALL_NEW'
        };

        try{

            let send = await dynamodb.deleteItem(params).promise(); console.log(send);

            if(send.Attributes.connectionId){
                response = { status:'success' };
            }

        }catch(err){

            response = { status:'failed', error:err };

        }

        return response;


    }else{

        return response;

    }

};