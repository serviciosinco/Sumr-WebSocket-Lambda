const   AWS = require('aws-sdk'),
        DYNAMO = new AWS.DynamoDB.DocumentClient(),
        { isDev } = require('../../../common'),
        { GetUserDetail } = require('../../../user'),
        uuidv4 = require("uuid/v4");

exports.SetAlive = async function(params=null){

    var response = {},
        data = params.data,
        UserDetail = await GetUserDetail({ id:data?.user });

    if(UserDetail?.id){
        
        try{
            
            paramsDynamo = {
                TableName: `${ isDev() ? 'dev':'prd' }-us-nvgt`,
                Item:{
                    id: uuidv4(),
                    user: UserDetail?.id,
                    connection:{
                        speed: data?.connection?.speed ? data.connection.speed : '',
                        rtt: data?.connection?.rtt ? data.connection.rtt : '',
                        type: data?.connection?.type ? data.connection.type : ''
                    },
                    navigation:{
                        cookie: data?.navigator?.cookie ? data.navigator.cookie:'',
                        online: data?.navigator?.online ? data.navigator.online:'',
                        memory: data?.navigator?.memory ? data.navigator.memory:''
                    },
                    ttl:new Date().setDate(new Date().getDate() + 7)
                },
                ReturnValues:"ALL_OLD"
            };

            let save =  await DYNAMO.put(paramsDynamo).promise();

            if(save){
                response.status = 'success';
            }

        }catch(e){

            console.log('err put:', e);
            response.error = e;

        }

    }

    return response;
    
}