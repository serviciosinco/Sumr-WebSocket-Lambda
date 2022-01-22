const   AWS = require('aws-sdk'),
        DYNAMO = new AWS.DynamoDB.DocumentClient(),
        { isDev } = require('./common');
        
exports.GetUserDetail = async(params)=>{

    var response = {};

    try{
        
        let tableSource = `${ isDev() ? 'dev':'prd' }-us`,
            paramsDynamo = {
                TableName : tableSource,
                IndexName: 'us_enc-index',
                KeyConditionExpression: '#encn=:idv',
                ExpressionAttributeNames:{ '#encn': 'us_enc' },
                ExpressionAttributeValues: { ':idv': params.id },
                Limit: 1
            };
                
        var get = await DYNAMO.query(paramsDynamo).promise();

        if(get?.Items[0]){
            response.id = get?.Items[0]?.id
        }

    }catch(e){

        response.error = e;

    }
    
    return response;

};