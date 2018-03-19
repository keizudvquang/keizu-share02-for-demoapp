const express = require('express')
const session = require('express-session');
const path = require('path')
const PORT = process.env.PORT || 5000

var pg = require('pg');
pg.defaults.ssl = true;
var pool = new pg.Client(process.env.DATABASE_URL);
var bodyParser = require('body-parser');
var app = express();
app.use(session({
    secret: 'demo',
    proxy: true,
    resave: true,
    saveUninitialized: true
}));
var request = require('request');
var connection = null;
var sess;
console.log('app start');
app
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    next();
});

app.post('/api/login', function (req, res) {
	console.log(req.body.username);
	request({
	  uri: "https://login.salesforce.com/services/oauth2/token",
	  method: "POST",
	  form: {
	    grant_type: "password",
	    client_id: "3MVG9ZL0ppGP5UrBkp4gcpR4zFArWdyWq_uSvtxHqB2Kh3XW9.DtvHL6_BBORBjn3MSRNvfQtldgmQL3VWb7D",
	    client_secret: "4597579409077764254",
	    username: req.body.username,
	    password: req.body.password
	  }
	}, 
	async function(error, response, body){
		var dt = JSON.parse(body);
		if(dt["access_token"] !== undefined){
			console.log('Login successfully');
			await createConnection()
			sess = req.session;
			sess.username = req.body.username;
			sess.password = req.body.password;
		  	connection.query("SELECT id, name FROM salesforce.User WHERE username ='" + req.body.username + "' ;", function(err, result) {
			 	if (err){
			 		console.log('Cannot get User info');
					res.send('false'); 
				}else{ 
					res.send(result.rows); 
				}
			});
			
		}else{
			console.log('Login fail');
			res.send('false');
		}
	});
});

app.get('/api/getContact', function(req, res){
	console.log('getContact');
	sess = req.session;
	console.log(sess.username);
	if(sess.username == undefined && sess.username == 1){
		console.log('Not Authorization');
		res.send("false"); 
	}else{
		connection.query('SELECT id, name, email FROM salesforce.Contact ;', function(err, result) {
		 	if (err){
		 		console.log(err);
				res.send("false");
			}else{ 
				res.send(result.rows); 
			}
		});
	}
});

app.get('/api/getOrder', function(req, res){
	console.log('getOrder');
	sess = req.session;
	console.log(sess.username);
	if(sess.username == undefined && sess.username == 1){
		console.log('Not Authorization');
		res.send("false"); 
	}else{
		connection.query('SELECT id, customername__c, productname__c FROM salesforce.Order__c ;', function(err, result) {
		 	if (err){
		 		console.log(err);
				res.send("false");
			}else{ 
				res.send(result.rows); 
			}
		});
	}
});

app.get('/api/order-detail/:id', function (request, response) {
	console.log('order-detail');
	var id = request.params.id;
	if(id === ''){
		response.send('fasle'); 
	}
  	connection.query("SELECT id, Order__c, CustomerName__c, ProductName__c,quantity__c,unitprice__c,orderdate__c FROM salesforce.Order__c WHERE id = " + id + " ;", function(err, result) {
	 	if (err){
			response.send("Error " + err); 
		}else{

			response.send(result.rows); 
		}
	});
});

app.post('/api/updateOrder', function(req, res){
	var data = req.body;
  	connection.query("UPDATE salesforce.Order__c SET customername__c = $1, productname__c = $2,quantity__c = $3,unitprice__c = $4,orderdate__c = $5 WHERE id = $6;",[data.customername__c, data.productname__c, data.quantity__c, data.unitprice__c, data.orderdate__c, data.id], function(err, result) {
	 	if (err){
			res.send("Error " + err); 
		}else{ 
			res.send('true'); 
		}
	});
});

app.post('/api/insertOrder', function(req, res){
	var data = req.body;
  	connection.query("INSERT INTO salesforce.Order__c(customername__c, productname__c, orderdate__c, quantity__c, unitprice__c) VALUES ($1, $2, $3, $4, $5);",[data.customername__c, data.productname__c, data.orderdate__c, data.quantity__c, data.unitprice__c], function(err, result) {
	 	if (err){
			res.send("Error " + err); 
		}else{ 
			res.send('true'); 
		}
	});
});

async function createConnection(){
	return new Promise( resolve => {
		if (connection == null){
			console.log('Start connect to Heroku');
			pool.connect(function(err, client, done) {
				if (err) {
					//console.log(err);
					process.exit(1);
				}
				connection = client;
				console.log('Heroku connected');
				return resolve(true);
			});
		}else{
			return resolve(true);
		}
	});
}
