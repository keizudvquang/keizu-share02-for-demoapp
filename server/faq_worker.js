const request = require('request')
const config = require('./config')
const db = require('./pghelper')

const getTokenURL    = config.api.sfGetTokenURL
const getFaqURL      = config.api.sfGetFaqURL
const clientId       = config.api.clientId
const clientSecret   = config.api.clientSecret
const username       = config.api.userName
const password       = config.api.password

function getAccessToken() {
	request.post({
        uri: getTokenURL,
        form: {
            'grant_type'    : 'password',
            'client_id'     : clientId,
            'client_secret' : clientSecret,
            'username'      : username,
            'password'      : password
        }
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
        	var obj = JSON.parse(body)
            getSfFAQ(obj.access_token, obj.instance_url)
        } else {
        	console.log(body)
        }
    });
}

function getSfFAQ(accessToken, instanceURL) {
	request.get({
        uri: instanceURL + getFaqURL,
        headers: {
        	'Authorization': 'Bearer ' + accessToken,
        	'X-PrettyPrint': 1
        },
        qs: {
            q: 'SELECT id,title,articlebody__c FROM faq__kav'
        }
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
        	var obj = JSON.parse(body)
            deleteFAQ(obj.records)
        } else {
        	console.log(body)
        }
    });
}

function deleteFAQ(faq) {
    db.query('DELETE FROM public.faq__kav')
        .then(function (data) {
            console.log('Delete successfully.')
            insertFAQ(faq)
        })
        .catch(function(err) {
            console.log(err)
        })
}

function insertFAQ(faq) {
    for (let q of faq ) {
        db.query('INSERT INTO public.faq__kav (title, articlebody__c) VALUES ($1, $2)',[q.Title, q.ArticleBody__c])
        .then(function (data) {
            console.log('Insert successfully.')
        })
        .catch(function(err) {
            console.log(err)
        })
    }
}

getAccessToken()