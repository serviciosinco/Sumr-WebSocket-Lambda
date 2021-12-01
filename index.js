require('dotenv').config({ path: './.env/.env' });
const   AWS = require('aws-sdk'), 
        { Connect, Disconnect } = require('./functions/services/websocket'),
        { MessageHandle } = require('./functions/services/messages/');

exports.handler = async (event) => {
    
    let response = { },
        eventType = event?.requestContext?.eventType;

    try {
            
        if(eventType == 'CONNECT'){
            
            let connect = await Connect(event);
            
            if(connect && connect.status == 'success'){
                return { 
                    statusCode: 200, 
                    body: JSON.stringify(connect) /*required on lambda proxy integration*/
                };
            }else{
                console.log('connect failure:',connect);
            }
    
        }else if(eventType == 'DISCONNECT'){
            
            let connect = await Disconnect(event);
            
            if(connect && connect.status == 'success'){
                return { 
                    statusCode: 200, 
                    body: JSON.stringify(connect) /*required on lambda proxy integration*/
                };
            }
    
        }else if(eventType == 'MESSAGE'){
            
            let message = await MessageHandle(event);
            
            if(message && message.status == 'success'){
                return { 
                    statusCode: 200, 
                    body: JSON.stringify(message)
                };
            }
    
        }else{

            console.log( eventType );

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