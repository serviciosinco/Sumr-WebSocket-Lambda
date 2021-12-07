const   AWS = require('aws-sdk'),
        DYNAMO = new AWS.DynamoDB.DocumentClient(),
        jwt = require('jsonwebtoken'),
        { isN } = require('../common'),
        { DBGet, DBSelector } = require('./connection');

exports.Connect = async(event)=>{

    var response = {},
        sessionToken = event?.queryStringParameters['session_token'];

    if(event){
        
        if(sessionToken){
            
            var SesDt = await this.SessionDetail({ id:sessionToken, type:'jwt' });

            if(SesDt?.id && SesDt?.est == 1){

                try{ console.log( 'SesDt:', SesDt );

                    let save =  await DYNAMO.put({
                                    TableName: 'dev-ws',
                                    Item:{
                                        connectionId: event.requestContext.connectionId,
                                        userId: SesDt?.us,
                                        allData: JSON.stringify(event),
                                        expiresOn: ( Date.parse(SesDt?.exp) / 1000 )
                                    },
                                    ReturnValues:'ALL_OLD'
                                }).promise();

                    if(save){
                        response = { status:'success' };
                    }

                }catch(err){

                    response = { status:'failed', error:err };
                
                }

            }else{

                response.error = `No SesDt result for ${sessionToken}`;

            }

        }else{
            
            response.status = 'failed';
            response.error = `Query parameters ${ JSON.stringify(event.queryStringParameters) }`;

        }

    }
    
    return response;

};


exports.Disconnect = async(event)=>{

    var response = { status:'start' };

    if(event){

        try{
            
            let remove = await DYNAMO.delete({
                            TableName: 'dev-ws',
                            Key: {
                                connectionId: event.requestContext.connectionId
                            }
                        }).promise();

            if(!remove){
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


exports.SessionDetail = async function(param=null){

    let fields='',
        response={e:'no'},
        tableSource = `${process?.env?.DYNAMO_PRFX}-us-ses`,
        item;

    try{

        if(param.type == 'enc'){ 
            fields = 'uses_enc';
        }else if(param.type == 'jwt'){
            fields = 'uses_enc'; 
            let decoded = jwt.verify(param.id, process.env.SUMR_JWT_KEY);
            param.id = decoded?.data?.session_id;
        }else{ 
            fields = 'id_uses';
        }
        
        if(param?.id){

            var get = await DYNAMO.query({
                        TableName : tableSource,
                        IndexName: 'uses_enc-index',
                        KeyConditionExpression: 'uses_enc = :encv',
                        ExpressionAttributeValues: { ':encv':param?.id },
                        Limit: 1
                    }).promise();
            
            if(!get?.Items[0]){
                
                var get = await DYNAMO.scan({
                        TableName: tableSource,
                        IndexName: 'uses_enc-index',
                        FilterExpression: 'uses_enc = :encv',
                        ExpressionAttributeValues: { ':encv':param?.id },
                        Limit: 1
                    }).promise();
                
            }else{

                item = get?.Items[0];

            }

            if(!get?.Items[0]){

                var get = await DBGet({
                                query: `SELECT id_uses, uses_enc, uses_est, uses_exp FROM `+DBSelector('us_ses')+` WHERE ${fields}=? LIMIT 1`,
                                data:[ param.id ]
                            });

                item = get[0];

            }else{

                item = get?.Items[0];

            }

            if(get && item){

                if(item){
                    response.id = item?.id ? item?.id : item.id_uses;
                    response.enc = item.uses_enc;
                    response.us = item.uses_us;
                    response.est = item.uses_est;
                    response.exp = item.uses_exp;
                }

            }else {

                response.w = 'No ID result';

            }

        }

    }catch(err){

        console.log('err:',err);
        response = { status:'failed', error:err };

    }


    return response;

};