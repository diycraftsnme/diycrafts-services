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
        sendMail: function(fromEmail, toEmail, reqsubject, reqContent, name, templateName, res){
            var fromMail = testFromMail, toMail = testToMail, subject = testSubject, content = testContent, mail;
            if(fromEmail){
                fromMail = fromEmail;
            }
            
            if(toEmail){
                toMail = toEmail;
            }

            if(reqsubject){
                subject = reqsubject;
            }

            if(reqContent){
                content = reqContent;
            }

            if(name){
                content = "Hello "+ name + "," + content;
            }
            var mailObj = this.getMailObject(fromMail, toMail, subject, content, name, templateName);
            var request = sg.emptyRequest({
                method: 'POST',
                path: '/v3/mail/send',
                body: mailObj
            });

            sg.API(request, function(error, response) {
                if(!error){
                    console.log(response.statusCode);
                    console.log(response.body);
                    console.log(response.headers);
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
        getMailObject: function(fromEmail, toEmail, subject, content,name, templateName ){
            var mail = new helper.Mail();
            var from_email = new helper.Email(fromEmail, testFromName);
            var to_email = new helper.Email(toEmail, name);
            //var _subject = subject;
            //var _content = new helper.Content('text/plain', content);
            mail.setFrom(from_email);

            //mail.setSubject(_subject);

            var personalization = new helper.Personalization();
            personalization.addTo(to_email);
            personalization.addBcc(from_email);
            var substitution = new helper.Substitution("%name%", name);
            personalization.addSubstitution(substitution);
            mail.addPersonalization(personalization);
            //mail.addContent(_content);
            mail.setTemplateId(constants[templateName]);
            mail.setReplyTo(from_email);
            var mailObj = mail.toJSON();
            //mailObj.template_id = 'a36d1ae6-6ba7-49a7-8694-d0698a8aeded';

            return mailObj;
        }
    };
    module.exports = mailServices;
})();