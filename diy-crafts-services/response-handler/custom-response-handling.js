/**
 * Created by nithyarad on 10/15/16.
 */
'use strict';

(function(){
    var customErrorObj = {
        targetError: function(res){
            if(res){
                res.status(401);
                res.json({
                    "status": "failure",
                    "severity": "error",
                    "message": "Service Target is required"
                });
            }
        },
        unAuthorizedError: function(res){
            if(res){
                res.status(403);
                res.json({
                    "status": "failure",
                    "severity": "error",
                    "message": "You do not have enough permissions to perform the action"
                });
            }
        },
        invalidRequest: function(res, errorMsg){
            if(res){
                res.status(401);
                res.json({
                    "status": "failure",
                    "severity": "error",
                    "err_msg": errorMsg || "Invalid request"
                });
            }
        },
        serverError: function(res, errorMsg){
            if(res){
                res.status(500);
                res.json({
                    "status": "failure",
                    "severity": "error",
                    "err_msg": errorMsg || "Internal Server Error"
                });
            }
        },
        successResponse: function(res, responseObject){
            if(res){
                res.status(200);
                res.json(responseObject);
            }
        }
    };
    module.exports = customErrorObj;
})();