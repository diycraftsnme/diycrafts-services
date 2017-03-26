/**
 * Created by nithyarad on 10/8/16.
 */

(function() {
    var assert = require('assert');
    var mailServices = require('./mail-services.js');
    var mongoUserInst = require("../request-handler/MongoDB.js").user;
    var Q = require('q');
    var matchedEmail;
    var userActions = {
        suggestContact: function(req, res){
            if(req &&req.headers['x-diycrafts-target']&& (req.headers['x-diycrafts-target'] === 'DIYCRAFTS_SUGGEST'|| req.headers['x-diycrafts-target'] === 'DIYCRAFTS_CONTACTUS')){
                if(req.body && req.body.email && req.body.name && req.body.subject && req.body.comment){
                    mailServices.sendMail(req.body.email, 'letscreate@diycraftsnme.com', req.body.subject, req.body.comment, req.body.name,'suggest_contact',res);
                }else{
                    res.status(401);
                    res.json({
                        "status": "failure",
                        "severity": "error",
                        "err_msg": "Invalid request"
                    });
                }
            }else{
                res.status(401);
                res.json({
                    "status": "failure",
                    "severity": "error",
                    "err_msg": "Service Target is required"
                });
            }
        },
        subscribe: function(req, res, isSubscribe){
            if(req && req.headers['x-diycrafts-target']){
                var headerTarget = req.headers['x-diycrafts-target'];
                if(req.body && req.body.email && req.body.name){
                    switch (headerTarget){
                        case 'DIYCRAFTS_SUBSCRIBE':
                            if(req.body && req.body.email && req.body.name){
                                var reqData = req.body;
                                var emailValidity = Q.resolve(validateUserEmail(reqData));
                                emailValidity.then(function(validUserEmail){
                                    if(validUserEmail){
                                        updateUserSubscription(reqData, res);
                                    }else if(matchedEmail){
                                        res.status(200);
                                        res.json({
                                            "status": "success",
                                            "message": "Email Id"+matchedEmail.email + 'is already subscribed to diycraftsnme.com'
                                        });
                                    }
                                });
                            }
                            break;
                        case 'DIYCRAFTS_UNSUBSCRIBE':
                            if(req.body && req.body.email && req.body.name){
                                var reqData = req.body;
                                var emailValidity = Q.resolve(validateUserEmail(reqData));
                                emailValidity.then(function(validUserEmail){
                                    if(!validUserEmail && matchedEmail){
                                        updateUserSubscription(reqData, res, true);
                                    }else{
                                        res.status(401);
                                        res.json({
                                            "status": "failure",
                                            "severity": "error",
                                            "message": "Email Id"+matchedEmail.email + 'is not subscribed to diycraftsnme.com'
                                        });
                                    }
                                });
                            }
                            break;
                        
                    }
                }else{
                    res.status(401);
                    res.json({
                        "status": "failure",
                        "severity": "error",
                        "err_msg": "Invalid request"
                    });
                }
            }else{
                res.status(401);
                res.json({
                    "status": "failure",
                    "severity": "error",
                    "err_msg": "Service Target is required"
                });
            }
        }
    };
    function validateUserEmail(reqData){
        if(reqData && reqData.email && reqData.name){
            var isValidEmail = false;
            var deferred = Q.defer();
            var validateEmail = mongoUserInst.find({email: reqData.email}, function (err, items) {
                if (assert.equal(null, err) || (items && items.length === 0)) {
                    validateEmail = true;
                } else if (items && items.length > 0) {
                    matchedEmail = items[0];
                    validateEmail = false;
                }
                deferred.resolve(validateEmail);
            });
            return deferred.promise;
        }
        
    }
    
    function updateUserSubscription(reqData, res, unSubscribe){
        if(reqData && res){
            var userObj = {
                name: reqData.name,
                email: reqData.email
            };
            var userDataSaved = mongoUserInst(userObj);
            if(!unSubscribe){
                userDataSaved.save([userObj], function(err, result){
                    if (!assert.equal(null, err)) {
                        mailServices.sendMail(undefined, reqData.email, 'Subscribed Successfully to diycraftsnme.com', 'You are now subscribed for notifications from diycraftsnme.com! Happy Crafting!!', reqData.name,'subscribe_success', res);
                        /*res.status(200);
                        res.json({
                            "status": 200,
                            "message": "You are now subscribed for notifications from diycraftsnme.com! Happy Crafting!!"
                        });*/
                    }else{
                        res.status(401);
                        res.json({
                            "status": 401,
                            "message": "We are currently unable to register your subscription. Please try after sometime"
                        });
                    }
                });
            }else{
                userDataSaved.collection.remove({email: reqData.email, name: reqData.name}, {justOne: true}, function(err, results){
                    if (!assert.equal(null, err)) {
                        mailServices.sendMail(undefined, reqData.email, 'Unsubscribed Successfully from diycraftsnme.com', 'You are now unsubscribed for notifications from diycraftsnme.com!', reqData.name, res);
                        /*res.status(200);
                        res.json({
                            "status": 200,
                            "message": "You are now unsubscribed for notifications from diycraftsnme.com!"
                        });*/
                    }else{
                        res.status(401);
                        res.json({
                            "status": 401,
                            "message": "We are currently unable to unsubscribe you. Please try after sometime"
                        });
                    }

                });
            }
        }
    }
    module.exports = userActions;
})();