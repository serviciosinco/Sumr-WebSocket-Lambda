require('dotenv').config({ path: './.env/.env' });
const AWS = require('aws-sdk');
const { Connect, Disconnect } = require('./functions/services/websocket');

exports.handler = async (event) => {
    
    let response = { status:'start' };

    try {

        if(event.requestContext.eventType){
            
            if(event.requestContext.eventType == 'CONNECT'){
               
                response = await Connect(event);
                
                if(response && response.status == 'success'){
                    return { 
                        statusCode: 200, 
                        body: JSON.stringify(response) /*required on lambda proxy integration*/
                    };
                }
        
            }else if(event.requestContext.eventType == 'DISCONNECT'){
               
                response = await Disconnect(event);
                
                if(response && response.status == 'success'){
                    return { 
                        statusCode: 200, 
                        body: JSON.stringify(response) /*required on lambda proxy integration*/
                    };
                }
        
            }

        }
        
    }catch(err){

        response['w'] = err.message;

        return{
            statusCode: 400,
            body: JSON.stringify(response)
        }

    }

};