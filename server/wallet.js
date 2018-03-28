var db = require('./pghelper'),
    winston = require('winston'),
    activities = require('./activities');
var QRCode = require('qrcode')
/**
 * Add a new offer to the user's wallet
 * @param req
 * @param res
 * @param next
 */
function addItem(req, res, next) {
    var userId = req.userId,
        offerId = req.body.offerId; // the id in the postgres table

    console.log(JSON.stringify(req.body));

    db.query('SELECT offerId FROM wallet WHERE userId=$1 AND offerId=$2', [userId, offerId], true)
        .then(function(offer) {
            if (offer) {
                return res.send(400, 'This offer is already in your wallet');
            }
            db.query('INSERT INTO wallet (userId, offerId) VALUES ($1, $2)', [userId, offerId], true)
                .then(function () {
                    return res.send('ok');
                })
                .fail(function(err) {
                    return next(err);
                });
        })
        .catch(next);
}

/**
 * Delete a offer from the user's wallet
 * @param req
 * @param res
 * @param next
 */
function deleteItem(req, res, next) {
    var userId = req.userId,
        offerId = req.params.id,
        externalUserId = req.externalUserId,
        offerSFID = req.body.offerSFID,
        points = req.body.points;

    db.query('DELETE FROM wallet WHERE userId=$1 AND offerId=$2', [userId, offerId], true)
        .then(function () {
            activities.getPointBalance(externalUserId)
                .then(function(result) {
                    var balance = (result && result.points) ? result.points : 0;
                    activities.deleteItem(externalUserId, offerSFID)
                        .then(function () {
                            return res.send({originalBalance: balance, points: points, newBalance: balance - points, originalStatus: activities.getStatus(balance), newStatus: activities.getStatus(balance - points)});
                        })
                        .catch(next);
                })
                .catch(next);
        })
        .catch(next);
}

/**
 * Delete all wallet items for the given user
 * @param userId
 * @returns {*}
 */
function deleteItems(userId) {
    console.log('deleting wallet items for user ' + userId);
    return db.query('DELETE FROM wallet WHERE userId=$1', [userId], true)
}

/**
 * Get the user's wallet
 * @param req
 * @param res
 * @param next
 */
function getItems(req, res, next) {
    var offset = req.params.offset
    var limit = req.params.limit
    var userId = req.userId;
    var contactId = req.body.contactId;

    db.query("SELECT id, sfId, name, startDate, endDate, description, serialid__c AS serialid, image__c AS image, campaignPage__c AS campaignPage, publishDate__c AS publishDate FROM wallet, salesforce.campaign WHERE offerId = id AND userId=$1 AND type='Offer' AND status='In Progress' AND IsActive = true ORDER BY publishDate DESC, name DESC, id DESC OFFSET $2 LIMIT $3",
            [userId, offset, limit])
        .then(function (offers) {
            // Create QR Code
            if (offers.length == 0) {
                return res.send(JSON.stringify(offers));
            }
            for (let i = 0; i < offers.length; i++) {
                let convertString = contactId + offers[i].serialid
                QRCode.toDataURL(convertString, function (err, url) {
                    console.log(url)
                    offers[i].qrcode = url
                    if (i == offers.length - 1) {
                        return res.send(JSON.stringify(offers));
                    }
                })
            }
        })
        .catch(next);
}

exports.addItem = addItem;
exports.deleteItem = deleteItem;
exports.getItems = getItems;
exports.deleteItems = deleteItems;