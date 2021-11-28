const   AWS = require('aws-sdk'),
        DYNAMO = new AWS.DynamoDB.DocumentClient(),
        jwt = require('jsonwebtoken'),
        { isN } = require('../common'),
        { DBGet, DBSelector } = require('./connection');

exports.Connect = async(event)=>{

    var response = {};

    if(!isN(event)){
        
        if(!isN( event.queryStringParameters ) && !isN( event.queryStringParameters['session_token'] )){
            
            var SesDt = await this.SessionDetail({ id:event.queryStringParameters['session_token'], t:'jwt' });

            if(SesDt.e == 'ok' && !isN(SesDt.id) && !isN(SesDt.est) && SesDt.est == 1){

                try{

                    let save =  await DYNAMO.putItem({
                                    TableName: 'dev-ws',
                                    Item: {
                                        connectionId: event.requestContext.connectionId,
                                        allData: JSON.stringify(event)
                                    },
                                    ReturnValues:'ALL_OLD'
                                }).promise();

                    if(!isN(save)){
                        response = { status:'success' };
                    }

                }catch(err){

                    response = { status:'failed', error:err };
                
                }

            }else{

                response.error = 'No SesDt result';

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

    if(!isN(event)){
        
        var DYNAMO = new AWS.DynamoDB.DocumentClient();

        try{
            
            let remove = await DYNAMO.deleteItem({
                            TableName: 'dev-ws',
                            Key: {
                                connectionId: event.requestContext.connectionId
                            }
                        }).promise();

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


exports.SessionDetail = async function(p=null){

    let fld='',
        rsp={e:'no'},
        tableSource = `${process?.env?.DYNAMO_PRFX}-us-ses`;

    try{

        if(p.t == 'enc'){ 
            fld = 'uses_enc';
        }else if(p.t == 'jwt'){
            fld = 'uses_enc'; 
            let decoded = jwt.verify(p.id, process.env.SUMR_JWT_KEY);
            p.id = decoded?.data?.session_id;
        }else{ 
            fld = 'id_uses';
        }
        
        if(p?.id){

            console.log(`Search with id: ${p.id}`);

            var get = await DYNAMO.query({
                        TableName : tableSource,
                        IndexName: 'uses_enc-index',
                        KeyConditionExpression: 'uses_enc = :encv',
                        ExpressionAttributeValues: { ':encv':p?.id },
                        Limit: 1
                    }).promise(); console.log('get query:',get);
            
            if(!get?.Items[0]){
                
                var get = await DYNAMO.scan({
                        TableName: tableSource,
                        IndexName: 'uses_enc-index',
                        FilterExpression: 'uses_enc = :encv',
                        ExpressionAttributeValues: { ':encv':p?.id },
                        Limit: 1
                    }).promise(); console.log('get scan:',get);
                    
            }

            if(!get?.Items[0]){

                var get = await DBGet({
                                    q: `SELECT id_uses, uses_enc, uses_est FROM `+DBSelector('us_ses')+` WHERE ${fld}=? LIMIT 1`,
                                    d:[ p.id ]
                                });

            }

            console.log('get form rds:',get);

            if(get){
                
                rsp.e = 'ok';

                if(!isN(get[0])){
                    rsp.id = get[0].id_uses;
                    rsp.enc = get[0].uses_enc;
                    rsp.est = get[0].uses_est;
                }

            }else {

                rsp.w = 'No ID result';

            }

        }

    }catch(err){

        console.log(err);
        rsp = { status:'failed', error:err };

    }


    return rsp;

};