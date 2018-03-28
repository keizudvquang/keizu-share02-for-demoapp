var db = require('./pghelper')

function findAll(offset, limit) {
	return db.query("SELECT id, title, articlebody__c FROM public.faq__kav ORDER BY id DESC OFFSET $1 LIMIT $2", [offset, limit]);
}

function findById(id) {
	return db.query("SELECT id, title, articlebody__c FROM public.faq__kav WHERE id = $1 ORDER BY id DESC", [id]);
}

exports.getAll = function(req, res, next) {
    var offset = req.params.offset
    var limit = req.params.limit
    findAll(offset, limit)
        .then(function (result) {
            console.log(JSON.stringify(result));
            return res.send(JSON.stringify(result));
        })
        .catch(next);
}

exports.getById = function(req, res, next) {
	var id = req.params.id
	findById(id)
        .then(function (result) {
            console.log(JSON.stringify(result));
            return res.send(JSON.stringify(result));
        })
        .catch(next);
}