var db = require('./pghelper'),
    winston = require('winston'),
    cloudinary = require('cloudinary');
/**
 * Add a new picture to the gallery
 * @param req
 * @param res
 * @param next
 */
function addItem(req, res, next) {
    // var userId = req.userId,
    //     url = req.body.url;

    // console.log(JSON.stringify(req.body));

    // db.query('INSERT INTO picture (userId, url) VALUES ($1, $2)', [userId, url], true)
    //     .then(function () {
    //         return res.send('ok');
    //     })
    // .catch(next);

    var public_id = req.body.public_id
    var url = req.body.url
    var userId = req.userId

    db.query('INSERT INTO picture (public_id, url, userId) VALUES ($1, $2, $3)', [public_id, url, userId], true)
        .then(function () {
            return res.send('ok');
        })
    .catch(next);
}

/**
 * Delete all the pictures for the given user
 * @param userId
 */
function deleteItems(req, res, next) {
    // var userId = req.userId;
    // db.query('DELETE FROM picture WHERE userId=$1', [userId], true)
    //     .then(function() {
    //         return res.send('ok');
    //     })
    //     .catch(next);

    var publicId = req.params.publicId
    console.log('publicId: ' + publicId)

    cloudinary.v2.uploader.destroy(publicId, function(error, result) {
        console.log('result: ' + result)
        console.log('error: ' + error)
        if (!error) {
            db.query('DELETE FROM public.picture WHERE public_id = $1', [publicId], true)
            .then(function(result) {
                console.log('result: ' + result)
                return res.send('ok');
            })
            .catch(next);
        }
    })
    
    
    
}

/**
 * Get the user's pictures
 * @param req
 * @param res
 * @param next
 */
function getItems(req, res, next) {
    var userId = req.userId;
    db.query("SELECT id, public_id, url, publishDate FROM picture WHERE userId=$1 ORDER BY publishDate DESC LIMIT 10",
        [userId])
        .then(function (pictures) {
            return res.send(JSON.stringify(pictures));
        })
        .catch(next);
}

function uploadPictureToCloud(req, res, next) {
    var file = req.body.file;
    cloudinary.uploader.upload(file, function(result) {
        return res.send(JSON.stringify(result))
    })
}

exports.addItem = addItem;
exports.deleteItems = deleteItems;
exports.getItems = getItems;
exports.uploadPictureToCloud = uploadPictureToCloud;