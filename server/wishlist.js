var db = require('./pghelper'),
    winston = require('winston'),
    activities = require('./activities');

/**
 * Add a new product to the user's wish list
 * @param req
 * @param res
 * @param next
 */
function addItem(req, res, next) {
    var userId = req.userId,
        productId = req.body.productId; // the id in the postgres table

    console.log(JSON.stringify(req.body));

    db.query('SELECT productId FROM wishlist WHERE userId=$1 AND productId=$2', [userId, productId], true)
        .then(function(product) {
            if (product) {
                return res.send(400, 'This product is already in your wish list');
            }
            db.query('INSERT INTO wishlist (userId, productId) VALUES ($1, $2)', [userId, productId], true)
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
 * Delete a product from the user's wish list
 * @param req
 * @param res
 * @param next
 */
function deleteItem(req, res, next) {
    var userId = req.userId,
        productId = req.params.id,
        externalUserId = req.externalUserId,
        productSFID = req.body.productSFID,
        points = req.body.points;

    db.query('DELETE FROM wishlist WHERE userId=$1 AND productId=$2', [userId, productId], true)
        .then(function () {
            activities.getPointBalance(externalUserId)
                .then(function(result) {
                    var balance = (result && result.points) ? result.points : 0;
                    activities.deleteItem(externalUserId, productSFID)
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
 * Delete all the wish list items for the given user
 * @param userId
 */
function deleteItems(userId) {
    console.log('deleting wish list items for user ' + userId);
    return db.query('DELETE FROM wishlist WHERE userId=$1', [userId], true);
}

/**
 * Get the user's wish list
 * @param req
 * @param res
 * @param next
 */
function getItems(req, res, next) {
    var offset = req.params.offset
    var limit = req.params.limit
    var userId = req.userId;
    db.query("SELECT id, sfId, name, description, image__c AS image, productPage__c AS productPage, publishDate__c AS publishDate FROM wishlist, salesforce.product2 WHERE productId = id AND userId=$1 AND IsActive = true ORDER BY publishDate DESC, name DESC, id DESC OFFSET $2 LIMIT $3",
            [userId, offset, limit])
        .then(function (products) {
            return res.send(JSON.stringify(products));
        })
        .catch(next);
}

exports.addItem = addItem;
exports.deleteItem = deleteItem;
exports.deleteItems = deleteItems;
exports.getItems = getItems;