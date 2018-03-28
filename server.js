var express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    compression = require('compression'),
    http = require('http'),
    path = require('path'),
    winston = require('winston'),
    sqlinit = require('./server/sqlinit'),
    cookieParser = require('cookie-parser'),
    csrf = require('csurf'),

    // App modules
    offers = require('./server/offers'),
    products = require('./server/products'),
    users = require('./server/users'),
    cases = require('./server/cases'),
    wallet = require('./server/wallet'),
    wishlist = require('./server/wishlist'),
    stores = require('./server/stores'),
    faq = require('./server/faq'),
    pictures = require('./server/pictures'),
    auth = require('./server/auth'),
    facebook = require('./server/facebook'),
    line = require('./server/line'),
    s3signing = require('./server/s3signing'),
    activities = require('./server/activities'),
    config = require('./server/config'),
    app = express();

app.set('port', process.env.PORT || 5000);
app.use(compression());
app.use(bodyParser({
    uploadDir: __dirname + '/uploads',
    keepExtensions: true
}));
app.use(methodOverride());
app.use(express.static(path.join(__dirname, './client')));
app.use(function(err, req, res, next) {
    console.log(err.stack);
    res.send(500, err.message);
});

// Ignore 3 route
var api = createApiRouter()
app.use('/lineAPI', api)

function createApiRouter () {
  var router = new express.Router()
  router.post('/getAccessTokenLINE', line.getAccessToken)
  router.post('/getUserProfileLINE', line.getUserProfile)
  router.post('/loginLINE', line.login)
  return router
}

// csrf
app.use(cookieParser('secretPassword'))
app.use(csrf({ cookie: true }))
app.use(function(req, res, next) {
    res.cookie('XSRF-TOKEN', req.csrfToken())
    return next()
});

app.use(function (err, req, res, next) {
    if (err.code !== 'EBADCSRFTOKEN') return next(err) 

    res.status(403)
    res.send("You don't have permission to access.")
})

app.get('/getConfig', function(req, res) {
    var line = new Object()
    line.lineChannelId   = config.api.lineChannelId
    line.lineCallbackURL = config.api.lineCallbackURL
    line.lineLoginURL    = config.api.lineLoginURL
    res.send(line)
})

app.post('/login', auth.login);
app.post('/logout', auth.validateToken, auth.logout);
app.post('/signup', auth.signup);

app.get('/users/me', auth.validateToken, users.getProfile);
app.put('/users/me', auth.validateToken, users.updateProfile);

app.get('/offers/:offset/:limit', auth.validateToken, offers.getAll);
app.post('/offers/:id', auth.validateToken, offers.getById);

app.get('/products/:offset/:limit', auth.validateToken, products.getAll);
app.get('/products/:id', auth.validateToken, products.getById);

app.get('/stores', auth.validateToken, stores.findAll);

app.get('/faq/:offset/:limit', auth.validateToken, faq.getAll)
app.get('/faq/:id', auth.validateToken, faq.getById)

app.post('/wallet/:offset/:limit', auth.validateToken, wallet.getItems);
app.post('/wallet', auth.validateToken, wallet.addItem);
app.delete('/wallet/:id', auth.validateToken, wallet.deleteItem);

app.get('/wishlist/:offset/:limit', auth.validateToken, wishlist.getItems);
app.post('/wishlist', auth.validateToken, wishlist.addItem);
app.delete('/wishlist/:id', auth.validateToken, wishlist.deleteItem);

app.get('/pictures', auth.validateToken, pictures.getItems);
app.post('/pictures', auth.validateToken, pictures.addItem);
app.delete('/pictures/:publicId', auth.validateToken, pictures.deleteItems);
app.post('/uploadPicture', auth.validateToken, pictures.uploadPictureToCloud)

app.get('/activities/:offset/:limit', auth.validateToken, activities.getItems);
app.post('/activities', auth.validateToken, activities.addItem);
app.delete('/activities', auth.validateToken, activities.deleteAll);

app.post('/cases', auth.validateToken, cases.createCase);
app.get('/nfrevoke', cases.revokeToken);

app.post('/s3signing', auth.validateToken, s3signing.sign);

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});