var db = require('./pghelper'),
    config = require('./config'),
    winston = require('winston');

function findAll(offset, limit) {
    return db.query('SELECT id, sfId, name, description, image__c AS image, productPage__c AS productPage, publishDate__c AS publishDate FROM salesforce.product2 WHERE Family=$1 AND IsActive = true ORDER BY publishDate DESC, name DESC, id DESC OFFSET $2 LIMIT $3', [config.productFamily, offset, limit]);
};

function findById(id) {
    return db.query('SELECT id, sfId, name, description, image__c AS image, productPage__c AS productPage, publishDate__c AS publishDate FROM salesforce.product2 WHERE id=$1', [id], true);
};

function getAll(req, res, next) {
    var offset = req.params.offset
    var limit = req.params.limit
    findAll(offset, limit)
        .then(function (products) {
            return res.send(JSON.stringify(products));
        })
        .catch(next);
};

function getById(req, res, next) {
    var id = req.params.id;
    findById(id)
        .then(function (product) {
            return res.send(JSON.stringify(product));
        })
        .catch(next);
};

exports.findAll = findAll;
exports.findById = findById;
exports.getAll = getAll;
exports.getById = getById;