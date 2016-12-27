(function() {
// Retrieve
    var assert = require('assert');
    var mongoCreateInst =  require("../request-handler/MongoDB.js").user;
    var jwt = require('jwt-simple');
    var Q = require('q');
    var bcrypt = require('bcrypt-nodejs');
    module.exports = {
        authorizeUser:authorizeUser
    };
    function authorizeUser(mode, req, res){
        var resData;
        switch (mode){
            case 'login':
                resData = authorizeLogin(req,res);
                return resData;
            case 'signup':
                resData = createUser(req,res);
                return resData;
            case 'authorize':
                var deferred = Q.defer();
                resData = validateUserAuthorization(req);
                deferred.resolve(resData);
                return deferred.promise;
        }
    }
    function authorizeLogin(req,res){
        var resObj = {};
        mongoCreateInst.find({email: req.email}, function (err, items) {
            if(!assert.equal(null, err)){
                Q.all([validateFindUserQueryResult(req, items)]).then(function(data){
                   if(data && data[0]){
                       var item = data[0];
                       if(item && item._id){
                           resObj = {
                               "status": "success",
                               user: {
                                   firstName: item.firstName,
                                   lastName: item.lastName
                               }
                           };
                           resObj = genToken(resObj);
                       } else{
                           resObj = {
                               "status": "failure",
                               "err_msg": "EmailId/Password is invalid"
                           };
                       }
                   }

                });
            }else if (err){
                resObj = {
                    "status": "failure",
                    "err_msg": "Unexpected Service Failure",
                    "err_field": "login"
                };
            }
            res.status(200);
            res.json(resObj);
        });
    }

    function createUser(req, res){
        var resObj = {};
        //duplicate check
        mongoCreateInst.find({emailId: req.emailId}, function (err, item) {
            if(item && item.length > 0){
                res.status(200);
                res.json({
                    "status": "failure",
                    "message": "emailId already exists",
                    "err_field": "emailId"
                });

            }else{
                // Insert a single document
                if(req.email && req.password && req.firstName && req.lastName){
                    bcrypt.hash(req.password, null, null, function(err, hash) {
                        // Store hash in your password DB.
                        var userObj = {
                           email: req.email,
                            passwordHash: hash,
                            firstName: req.firstName,
                            lastName: req.lastName
                        };
                        var newUser = mongoCreateInst(userObj);
                        newUser.save([userObj], function (err, result) {
                            if(!assert.equal(null, err)){
                                res.json({
                                    "status":200,
                                    "message":"Signup successful"
                                });
                            }else if (err){
                                res.status(401);
                                res.json({
                                    "status": 401,
                                    "message": "Invalid credentials"
                                });
                            }
                        });
                    });
                }
            }
        });
    }
    // private method
    function genToken(user) {
        var expires = expiresIn(7); // 7 days
        var payloadTokenObj = {exp:expires,userid:user.userid};
        var token = jwt.encode(payloadTokenObj, require('../config/secret')());
        return{
            token: token,
            expires: expires,
            user: user
        };
    }
    function expiresIn(numDays) {
        var dateObj = new Date();
        return dateObj.setDate(dateObj.getDate() + numDays);
    }

    function validateFindUserQueryResult(req, items, validatorKey) {
        var itemFound = {};
        if (items && items.length > 0) {
            for (var indx = 0; indx < items.length; indx++) {
                var item = items[indx];
                if(!validatorKey){
                    if (item && item.emailId === req.emailId) {
                        // Load hash from your password DB.
                        bcrypt.compare(req.password, item.passwordHash, function(err, pwdMatch) {
                            if(pwdMatch){
                                itemFound = item;
                            }
                        });
                    }
                }else if(validatorKey){
                    if (item && item[validatorKey] === req) {
                        itemFound = item;
                        break;
                    }
                }
            }
        }
        return itemFound;
    }

    function validateUserAuthorization(userid){
        var deferred = Q.defer();
        var resObj = mongoCreateInst.find({_id: userid}, function (err, items) {
            if(!assert.equal(null, err)){
                Q.all([validateFindUserQueryResult(userid, items, 'id')]).then(function(data){
                    if(data && data[0]){
                        var item = data[0];
                        if(item && item.id){
                            resObj = {
                                "status": "success",
                                "_id": item.id
                            };
                        } else{
                            //emailId is invalid
                            resObj = {
                                "status": "failure",
                                "severity": "error",
                                "err_msg": "Invalid Request"
                            };
                        }
                    }

                });
            }else if (err){
                resObj = {
                    "status": "failure",
                    "severity": "error",
                    "err_msg": "Unexpected Service Failure"
                };
            }
            deferred.resolve(resObj);
        });
        return deferred.promise;
    }
})();