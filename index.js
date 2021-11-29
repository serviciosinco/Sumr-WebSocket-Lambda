require('dotenv').config({ path: './.env/.env' });
const   AWS = require('aws-sdk'), 
        { Connect, Disconnect } = require('./functions/services/websocket'),
        { MessageHandle } = require('./functions/services/messages/');

exports.handler = async (event) => {
    
    let response = { status:'start' };

    try {

        if(event?.requestContext?.eventType){
            
            if(event?.requestContext?.eventType == 'CONNECT'){
               
                let connect = await Connect(event);
                
                if(connect && connect.status == 'success'){
                    return { 
                        statusCode: 200, 
                        body: JSON.stringify(connect) /*required on lambda proxy integration*/
                    };
                }else{
                    console.log('connect failure:',connect);
                }
        
            }else if(event?.requestContext?.eventType == 'DISCONNECT'){
               
                let connect = await Disconnect(event);
                
                if(connect && connect.status == 'success'){
                    return { 
                        statusCode: 200, 
                        body: JSON.stringify(connect) /*required on lambda proxy integration*/
                    };
                }
        
            }else if(event?.requestContext?.eventType == 'MESSAGE'){
               
                let message = await MessageHandle(event);
                
                if(message && message.status == 'success'){
                    return { 
                        statusCode: 200, 
                        body: JSON.stringify(message)
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