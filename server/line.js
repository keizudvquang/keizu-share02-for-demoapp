var winston = require("winston"),
    Q = require('q'),
    auth = require('./auth'),
    db = require('./pghelper'),
    config = require('./config'),
    request = require('request');

function getAccessToken(req, res, next) {
    var authorizationCode = req.body.code;
    var channelId         = config.api.lineChannelId;
    var channelSecret     = config.api.lineChannelSecret;
    var callbackURL       = config.api.lineCallbackURL;
    var getTokenURL       = config.api.lineGetTokenURL;
    
    request.post({
        uri: getTokenURL,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: {
            grant_type    : 'authorization_code',
            client_id     : channelId,
            client_secret : channelSecret,
            redirect_uri  : callbackURL,
            code          : authorizationCode
        }
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            return res.send(body);
        } else {
            return res.send(response.statusCode, error);
        }
    });
}

function getUserProfile(req, res, next) {
    var lineToken      = req.body.lineToken;
    var lineGetUserURL = config.api.lineGetProfileURL;

    request.get({
        uri: lineGetUserURL,
        headers: {'Authorization': 'Bearer ' + lineToken}
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            return res.send(body);
        } else {
            return res.send(response.statusCode, error);
        }
    });
}

function login(req, res, next) {
    var lineUser = req.body.lineUser;

    function createAndSendToken(user) {
        auth.createAccessToken(user)
            .then(function(token) {
                var response = {'user':{'email': user.email, 'firstname': user.firstname, 'lastname': user.lastname}, 'token': token};
                winston.info(JSON.stringify(response));
                return res.send(response);
            })
            .catch(next);
    }

    db.query('SELECT id, firstname, lastname, email, loyaltyid__c as externalUserId FROM salesforce.contact WHERE lineuserid__c = $1', [lineUser.userId], true)
        .then(function (user) {
            if (user) {
                return createAndSendToken(user);
            } else {
                createUser(lineUser).then(createAndSendToken).catch(next);
            }
        })
        .catch(next);
}

// Create a user based on a LINE user
function createUser(lineUser) {
    var externalUserId = (+new Date()).toString(36);
    return db.query(
        'INSERT INTO salesforce.contact (lastname, leadsource, lineuserid__c, pictureURL__c, description, loyaltyid__c) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, lastName, leadsource, lineuserid__c, pictureURL__c as pictureURL, description, loyaltyid__c as externalUserId',
        [lineUser.displayName, 'Loyalty App', lineUser.userId, lineUser.pictureUrl, lineUser.statusMessage, externalUserId], true);
}

exports.getAccessToken = getAccessToken;
exports.getUserProfile = getUserProfile;
exports.login = login;
