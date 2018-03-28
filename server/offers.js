var db = require('./pghelper'),
    winston = require('winston');
var QRCode = require('qrcode')

function findAll(offset, limit) {
    return db.query("SELECT id, sfId, name, startDate, endDate, description, image__c AS image, campaignPage__c AS campaignPage, publishDate__c AS publishDate FROM salesforce.campaign WHERE type='Offer' AND status='In Progress' AND IsActive = true ORDER BY publishDate DESC, name DESC, id DESC OFFSET $1 LIMIT $2", [offset, limit]);
};

function findById(id) {
    // Retrieve offer either by Salesforce id or Postgress id
    return db.query('SELECT id, sfId, name, startDate, endDate, description, serialid__c AS serialid, image__c AS image, campaignPage__c AS campaignPage, publishDate__c AS publishDate FROM salesforce.campaign WHERE ' + (isNaN(id) ? 'sfId' : 'id') + '=$1', [id], true);
};

function getAll(req, res, next) {
    var offset = req.params.offset
    var limit = req.params.limit
    findAll(offset, limit)
        .then(function (offers) {
            console.log(JSON.stringify(offers));
            return res.send(JSON.stringify(offers));
        })
        .catch(next);
};

function getById(req, res, next) {
    var id = req.params.id;
    var contactId = req.body.contactId;
    findById(id)
        .then(function (offer) {
            // Create QR Code
            var convertString = contactId + offer.serialid
            QRCode.toDataURL(convertString, function (err, url) {
                console.log(url)
                offer.qrcode = url
                console.log(JSON.stringify(offer));
                return res.send(JSON.stringify(offer));
            })
        })
        .catch(next);
};

exports.findAll = findAll;
exports.findById = findById;
exports.getAll = getAll;
exports.getById = getById;