const AWS = require('aws-sdk');
const { isN } = require('./common');

exports.connect = async(event)=>{

    var response = { status:'start' };

    if(!isN(event)){
        
        var dynamodb = new AWS.DynamoDB();

        try{

            let save =  await dynamodb.putItem({
                            TableName: 'dev-ws',
                            Item: {
                                connectionId: { S: event.requestContext.connectionId },
                                allData: { S: JSON.stringify(event) }
                            },
                            ReturnValues:'ALL_OLD'
                        }).promise();

            if(!isN(save)){
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

        await dynamodb.putItem({
            TableName: 'dev-ws',
            Item: {
                connectionId: { S: 'OLD_'+event.requestContext.connectionId },
                allData: { S: JSON.stringify(event) }
            }
        }).promise();

        try{
            
            let remove = await dynamodb.deleteItem({
                            TableName: 'dev-ws',
                            Key: {
                                connectionId: { S:event.requestContext.connectionId }
                            }
                        }).promise(); console.log(remove);

            if(!isN(remove)){
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