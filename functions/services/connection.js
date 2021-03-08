//const { Console } = require('console');
const mysql = require('promise-mysql');
const { isN, mySecrets } = require('../common');

var Connection = ''

const Connect = async(p=null)=>{

	var host,user,password,port;

	//if(process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'developer'){

		host = process.env.RDS_HOST;
		user = process.env.RDS_USERNAME;
		password = process.env.RDS_PASSWORD;
		port = process.env.RDS_PORT ? process.env.RDS_PORT : 3306;

	/*}else{

		let sm_type = process.env.RDS_SM_READ;
		if(p.t == 'wrt'){ sm_type = process.env.RDS_SM_WRTE;}
		let sm_data = await mySecrets( sm_type );

		if(	!isN(sm_data)){
			host = sm_data.host;
			port = sm_data.port;
			user = sm_data.username;
			password = sm_data.password ? sm_data.password : 3306;
		}

	}*/

	if(	!isN(p) &&
		!isN(p.t) &&
		!isN(host) &&
		!isN(user) &&
		!isN(password)
	){

		let stng,
			pool,
			cnx;

		try{

			stng = {
				database: 'sumr_bd',
				host: host,
				user: user,
				password: password,
				port: port,
				connectionLimit: 10,
			};

			pool = await mysql.createPool(stng);
			cnx = pool.getConnection();
			return cnx;

		}catch(e){

			console.error('Connect error:', e);

		}

	}else{

		console.error('No data for connection');

	}

};

exports.DBSelector = (v=null, d=null)=>{

	let r=null,
		db=process.env.DBM;

	if(!isN(d)){
		if(d=='d'){ db=process.env.DBD; }
		else if(d=='c'){ db=process.env.DBC; }
		else if(d=='t'){ db=process.env.DBT; }
		else if(d=='p'){ db=process.env.DBP; }
		else{ db=d; }
	}

	if(!isN(v)){
		if(v.indexOf('.') !== -1){ r=v; }else{ r=db+'.'+v; }
	}else{
		r='';
	}

	return r;
},

exports.cls = async function(p){
	Connection.end(function(){
		//console.log(' Conexion cerrada \n\n');
	});
},

exports.DBGet = async function(p=null){

	if( !isN(p) && !isN(p.q) ){

		let svle = [];
		let rsp = {};
		Connection = await Connect({ t:'rd' });

		if(!isN(p.d)){ svle = p.d; }

		if(!isN(Connection)){
			try {

				let qry = mysql.format(p.q, svle);
				let prc = await Connection.query(qry);

				if(prc){ rsp = prc; }

			}catch(ex){
				await Connection.query("ROLLBACK");
				rsp.w = ex;
			}finally{
				await Connection.release();
				await Connection.destroy();
			}
		}

		return rsp;

	}

};

exports.DBSave = async function(p=null){

	if( !isN(p) && !isN(p.q) ){

		let svle = [];
		let rsp = {e:'no'};
		Connection = await Connect({t:'wrt'});

		if(!isN(Connection)){

			try {

				if(!isN(p.d)){
					svle = p.d; 
					var qry = mysql.format(p.q, svle);
				}else{
					var qry = p.q;
				}

				let prc = await Connection.query(qry);
				if(prc){ rsp = prc; }

			}catch(ex){
				await Connection.query("ROLLBACK");
				rsp.w = ex;
			}finally{
				await Connection.release();
				await Connection.destroy();
			}

		}

		return rsp;

	}

};