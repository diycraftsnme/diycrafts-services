
    var mailServices = require('../UserServices/mail-services.js');
    var userActions = require('../UserServices/user-actions.js');
    
    var users = {
        test: function(req, res){
            mailServices.sendMail(req, res);
        },
        suggestContact: function(req, res){
            userActions.suggestContact(req, res);
        },
        subscribe: function (req, res) {
            userActions.subscribe(req, res, true);
        },
        unSubscribe: function(req, res){
            userActions.subscribe(req, res, false)
        }
    };
    module.exports = users;