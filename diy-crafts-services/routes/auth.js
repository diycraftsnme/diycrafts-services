(function() {
var Q = require('q');
var repoConnect = require('../middleware/loginValidator.js');
var auth = {
    login: function(req, res) {
        var emailId = req.body.emailId || '';
        var password = req.body.password || '';
        if (emailId == '' || password == '') {
            res.status(401);
            res.json({
                "status": 401,
                "message": "Invalid credentials"
            });
            return;
        }
        // Fire a query to your DB and check if the credentials are valid
        var dbUserObj = auth.validateLogin(req, res);
    },
    signup: function(req, res){
        var emailId = req.body.emailId || '';
        var password = req.body.password || '';
        if (emailId == '' || password == '') {
            res.status(401);
            res.json({
                "status": 401,
                "message": "Invalid credentials"
            });
            return;
        }
        // Fire a query to your DB and check if the credentials are valid
        var dbUserObj = auth.validateSignup(req, res);
    },
    validateLogin: function(req, res, callback) {
        // spoofing the DB response for simplicity
        var dbUserObj = repoConnect.authorizeUser('login', req.body, res);
        return dbUserObj;
    },
    validateSignup: function(req, res, callback) {
        // spoofing the DB response for simplicity
        var dbUserObj = repoConnect.authorizeUser('signup', req.body, res);
        return dbUserObj;
    },
    validateUser: function(userid) {
        var deferred = Q.defer();
        var dbUserObj = repoConnect.authorizeUser('authorize', userid);
        deferred.resolve(dbUserObj);
        return deferred.promise;
    }
};

module.exports = auth;
})();