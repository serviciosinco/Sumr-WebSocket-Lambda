const AWS = require('aws-sdk');
const { connect, disconnect } = require('./services/connection');

exports.handler = async (event) => {
    
    let response = { e:'no' };

    try {

        if(event.requestContext.eventType){
            
            if(event.requestContext.eventType == 'CONNECT'){
               
                response = await connect(event);
                
                return { 
                    statusCode: 200, 
                    body: JSON.stringify(response) /*required on lambda proxy integration*/
                };
        
            }else if(event.requestContext.eventType == 'DISCONNECT'){
               
                response = await disconnect(event);
                
                return { 
                    statusCode: 200, 
                    body: JSON.stringify(response) /*required on lambda proxy integration*/
                };
        
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