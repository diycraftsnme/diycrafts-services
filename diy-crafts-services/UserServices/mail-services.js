/**
 * Created by nithyarad on 10/8/16.
 */
"use strict";
(function(){
    var helper = require('sendgrid').mail;
    var testFromMail = 'letscreate@diycraftsnme.com';
    var testToMail = 'muthukrishnan.suresh1987@gmail.com';
    var testSubject = 'Test Send';
    var testContent = 'Hello, Email!';
    //var mail = new helper.Mail(from_email, _subject, to_email, _content);
    var accessKey = require('../config/access-key.js');
    var sg = require('sendgrid')(accessKey);

    var mailServices = {
        sendMail: function(fromEmail, toEmail, reqsubject, reqContent, name, res){
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
            var from_email = new helper.Email(fromMail);
            var to_email = new helper.Email(toMail);
            var _subject = subject;
            var _content = new helper.Content('text/plain', content);
            if(from_email && to_email && _subject && _content){
                mail = new helper.Mail(from_email, _subject, to_email, _content);
            }
            var request = sg.emptyRequest({
                method: 'POST',
                path: '/v3/mail/send',
                body: mail.toJSON()
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
        storeSuggestContact: function(fromEmail, toEmail, subject, content){

        }
    };
    module.exports = mailServices;
})();