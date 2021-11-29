const { SetAlive } = require('./user/alive');

exports.MessageHandle = async function(event=null){

    const   request = JSON.parse( event?.Records[0].body ),
            service = request?.service,
            action = request?.action,
            data = request?.data,
            params = { action:action, data:data };

    if(service == 'alive'){
        if(action == 'savedata') return await SetAlive(params);
    }

}