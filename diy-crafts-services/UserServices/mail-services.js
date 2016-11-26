/**
 * Created by nithyarad on 10/8/16.
 */
"use strict";
(function(){
    var helper = require('sendgrid').mail;
    var sendgrid = require('sendgrid');
    var testFromMail = 'letscreate@diycraftsnme.com';
    var testFromName = 'DiyCraftsNMe';
    var testToMail = 'muthukrishnan.suresh1987@gmail.com';
    var testSubject = 'Test Send';
    var testContent = 'Hello, Email!';
    var accessKey = require('../config/access-key.js');
    var sg = require('sendgrid')(accessKey);
    var constants = require('../config/constants.js');
    var mailServices = {
        sendMail: function(res, _mailObj, templateName, substitutionObj){
            var fromMail = testFromMail, toMail = testToMail, subject = testSubject, content = testContent, mail, name;
            if(_mailObj){
                if(_mailObj.fromEmail){
                    fromMail = _mailObj.fromEmail;
                }

                if(_mailObj.toEmail){
                    toMail = _mailObj.toEmail;
                }

                if(_mailObj.subject){
                    subject = _mailObj.subject;
                }

                if(_mailObj.content){
                    content = _mailObj.content;
                }

                if(_mailObj.name){
                    content = "Hello "+ _mailObj.name + "," + content;
                    name = _mailObj.name;
                }
            }
            var mailObj = this.getMailObject(fromMail, toMail, subject, content, name, templateName, substitutionObj);
            var request = sg.emptyRequest({
                method: 'POST',
                path: '/v3/mail/send',
                body: mailObj
            });

            sg.API(request, function(error, response) {
                if(!error){
                    if(res){
                        res.status(200);
                        res.json({
                            "status": "success",
                            "message": "Request accepted. We will get back to you as soon as possible"
                        });
                        return;
                    }
                }else{
                    if(res){
                        res.status(401);
                        res.json({
                            "status": "failure",
                            "message": "Sorry we're unable to process your request right now. Please try after sometime "
                        });
                        return;
                    }
                }
            });
        },
        storeSuggestContact: function(fromEmail, toEmail, subject, content, name){

        },
        getMailObject: function(fromEmail, toEmail, subject, content,name, templateName, substitutionObj ){
            var mail = new helper.Mail();
            var from_email = new helper.Email(fromEmail, testFromName);
            var to_email = new helper.Email(toEmail, name);
            var _content = new helper.Content('text/plain', content);
            mail.setFrom(from_email);
            var personalization = new helper.Personalization();
            personalization.addTo(to_email);
            personalization.addBcc(from_email);
            if(substitutionObj){
                for(var prop in substitutionObj){
                    if(substitutionObj.hasOwnProperty(prop)){
                        var val = substitutionObj[prop];
                        var substitution = new helper.Substitution('%'+prop+'%', val);
                        personalization.addSubstitution(substitution);
                    }
                }
            }else{
                var substitution = new helper.Substitution("%name%", name);
                personalization.addSubstitution(substitution);
            }
            mail.addPersonalization(personalization);
            //mail.addContent(_content);
            var template = constants.template[templateName];
            if(template){
                mail.setTemplateId(constants.template[templateName]);
            }else{
                mail.setSubject(subject);
                mail.addContent(_content);
            }
            mail.setReplyTo(from_email); 
            var mailObj = mail.toJSON();

            return mailObj;
        }
    };
    module.exports = mailServices;
})();