const AWS = require('aws-sdk');
const { isN } = require('../common');

exports.Connect = async(event)=>{

    var response = { status:'start' };

    if(!isN(event)){
        
        if(!isN( event.queryStringParameters ) && !isN( event.queryStringParameters['session_token'] )){
            
            var SesDt = await SessionDetail({ id:event.queryStringParameters['session_token'], t:'enc' });

            if(SesDt.e == 'ok'){

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

            }

        }

    }else{

        return response;

    }

};


exports.Disconnect = async(event)=>{

    var response = { status:'start' };

    if(!isN(event)){
        
        var dynamodb = new AWS.DynamoDB();

        try{
            
            let remove = await dynamodb.deleteItem({
                            TableName: 'dev-ws',
                            Key: {
                                connectionId: { S:event.requestContext.connectionId }
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
        rsp={e:'no'};

    if(p.t == 'enc'){ fld = 'uses_enc'; }
    else{ fld = 'id_uses'; }

    let get = await DBGet({
                        q: `SELECT id_uses, uses_enc, uses_est FROM `+DBSelector('us_ses')+` WHERE ${fld}=? LIMIT 1`,
                        d:[ p.id ]
                    });

    if(get){
        rsp.e = 'ok';
        if(!isN(get[0])){
            rsp.id = get[0].id_uses;
            rsp.enc = get[0].uses_enc;
            rsp.est = get[0].uses_est;
        }
    }else {
        rsp['w'] = 'No ID result';
    }

    return rsp;

};