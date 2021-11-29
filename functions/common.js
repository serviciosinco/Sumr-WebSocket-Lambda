exports.isN = (p)=>{
	try{
		if(p==undefined || p==null || p==''){ return true;}else{return false;}
	}catch(err) {
		console.info(err.message);
		console.log(err);
	}
};

exports.isDev = ()=>{
	if(process.env.NODE_ENV == 'production') return false;
	return true;
}
