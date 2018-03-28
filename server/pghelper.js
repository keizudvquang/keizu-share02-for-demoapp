var config = require('./config'),
    Q = require('q'),
    winston = require('winston'),
    databaseURL = config.databaseURL;

const { Pool} = require('pg')
const pool = new Pool({
  connectionString: databaseURL
})

/**
 * Utility function to execute a SQL query against a Postgres database
 * @param sql
 * @param values
 * @param singleItem
 * @returns {promise|*|Q.promise}
 */
exports.query = function (sql, values, singleItem, dontLog) {

    if (!dontLog) {
        typeof values !== 'undefined' ? console.log(sql, values) : console.log(sql);
    }

    var deferred = Q.defer();

    pool.connect(function (err, conn, done) {
        if (err) return deferred.reject(err);
        try {
            conn.query(sql, values, function (err, result) {
                done();
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(singleItem ? result.rows[0] : result.rows);
                }
            });
        }
        catch (e) {
            done();
            deferred.reject(e);
        }
    });

    return deferred.promise;
 
};

exports.close = function() {
    pool.end();
}