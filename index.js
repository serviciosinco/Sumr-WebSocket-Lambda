require('dotenv').config({ path: './.env/.env' });
const AWS = require('aws-sdk');
const { Connect, Disconnect } = require('./functions/services/websocket');

exports.handler = async (event) => {
    
    let response = { status:'start' };

    try {

        if(event.requestContext.eventType){
            
            if(event.requestContext.eventType == 'CONNECT'){
               
                let connect = await Connect(event); console.log('Lets connect :',Connect);
                
                if(connect && connect.status == 'success'){ console.log('Succc:',connect);
                    return { 
                        statusCode: 200, 
                        body: JSON.stringify(connect) /*required on lambda proxy integration*/
                    };
                }else{
                    console.log('connect:',connect);
                }
        
            }else if(event.requestContext.eventType == 'DISCONNECT'){
               
                let connect = await Disconnect(event);
                
                if(connect && connect.status == 'success'){
                    return { 
                        statusCode: 200, 
                        body: JSON.stringify(connect) /*required on lambda proxy integration*/
                    };
                }
        
            }

        }
        
    }catch(err){

        response.error = err.message;

        return{
            statusCode: 400,
            body: JSON.stringify(response)
        }

    }

    return response;

};