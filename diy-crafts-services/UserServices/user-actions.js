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
                    var substitutionObj = {
                        from: req.body.email,
                        name: req.body.name,
                        subject: req.body.subject,
                        comment: req.body.comment
                    };
                    var mailObj = {
                        fromEmail: 'diycraftsnme@gmail.com',
                        toEmail: 'letscreate@diycraftsnme.com',
                        subject: req.body.subject,
                        comment: req.body.comment,
                        name: req.body.name
                    };
                    mailServices.sendMail(res, mailObj, 'suggest_contact', substitutionObj);
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
        subscribe: function(req, res){
            if(req && req.headers['x-diycrafts-target']){
                var headerTarget = req.headers['x-diycrafts-target'];
                if(req.body && ((req.body.email && req.body.name) || (req.params && req.params.userId))){
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
                            if(req.params && req.params.userId){
                                var reqData = {userId: req.params.userId};
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
        if(reqData){
            var isValidEmail = false;
            var deferred = Q.defer();
            var query = {};
            if(reqData.email && reqData.name){
                query.email = reqData.email;
            }else if(reqData.userId){
                query.id = reqData.userId;
            }
            var validateEmail = mongoUserInst.find(query, function (err, items) {
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
                        var mailObj = {
                            fromMail: undefined,
                            toMail: reqData.email,
                            subject: 'Subscribed Successfully to diycraftsnme.com',
                            content: 'You are now subscribed for notifications from diycraftsnme.com! Happy Crafting!!',
                            name: reqData.name,
                            subscriberId: result.id
                        };
                        var substitutionObj = {
                            name: reqData.name,
                            subscriberId: result.id
                        };
                        mailServices.sendMail(res, mailObj,'subscribe_success', substitutionObj);
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