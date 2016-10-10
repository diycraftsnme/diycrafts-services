var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server.js');
var should = chai.should();
var expect = chai.expect;
var rewire = require("rewire");
var mongoose = require('mongoose');
var express = require('express');
var request = require('request');
var assert = require('assert');
chai.use(chaiHttp);
describe('Server test', function(){
    var randomUserid = (Math.random()*3).toFixed(1), workDate = new Date().getTime();
    before(function(done) {
        mongoose.createConnection('mongodb://MuthuNithya:862014@ds033143.mongolab.com:33143/dreamlion');
        done();
    });
    after(function(done) {
        //mongoose.connection.close();
        done();
    });
    describe('Test server js file', function(){
       it('Should set response headers', function(done){
           var options = {
               url: 'http://localhost:8000/test',
               path: '/',
               method: 'GET',
               headers:{
                   'WM_TARGET': 'login'
               }
           };
           done();
           /*request(options, function(err, res){
               done();
           });*/
       });
        it('Should test the options request with headers', function(done){
            var options = {
                url: 'http://localhost:8000',
                path: '/',
                method: 'OPTIONS'
            };
            request(options, function(err, res){
                done();
            });
        });
        it('Should test login services with invalid credentials', function(done){
            var options = {
                url: 'http://localhost:8000/login',
                method: 'POST',
                headers: {
                    "WM_TARGET": 'login'
                },
                data: {
                    username: 'Test_Email@dreamlion.com',
                    password: 'Test1_Email'
                }
            };
            request(options, function(err, res){
                done();
            });
        });
        it('Should test login services with correct credentials', function(done){
            var options = {
                url: 'http://localhost:8000/login',
                method: 'POST',
                headers: {
                    "WM_TARGET": 'login'
                },
                json: {
                    emailId: 'Test1_Email@dreamlion.com',
                    password: 'Test1_Email'
                }
            };
            request(options, function(err, res){
                done();
            });
        });
        it('Should signup new user successfully', function(done){
            var options = {
                url: 'http://localhost:8000/signup',
                method: 'POST',
                json: {
                    emailId: 'Test'+randomUserid+'_Email@dreamlion.com',
                    password: 'Test'+randomUserid+'_Email',
                    username: 'Test'+randomUserid+'_Email'
                }
            };
            request(options, function(err, res){
                done();
            });
        });
        it('Should signup new user with invalid credentials', function(done){
            var options = {
                url: 'http://localhost:8000/signup',
                method: 'POST',
                headers: {
                    "WM_TARGET": 'signup'
                },
                json: {
                    emailId: 'Test2_Email@dreamlion.com',
                    username: 'Test2_Email'
                }
            };
            request(options, function(err, res){
                done();
            });
        });
        it('Should signup new user with invalid credentials', function(done){
            var options = {
                url: 'http://localhost:8000/signup',
                method: 'POST',
                headers: {
                    "WM_TARGET": 'signup'
                },
                json: {
                    emailId: 'Test2_Email@dreamlion.com',
                    password: 'Te_Email'
                }
            };
            request(options, function(err, res){
                done();
            });
        });
        describe('Should test services with logged in user', function(){
            var _servResponse, user, userid, token;
            this.timeout(5000);
            before(function (done) {
                var options = {
                    url: 'http://localhost:8000/login',
                    method: 'POST',
                    headers: {
                        "WM_TARGET": 'login'
                    },
                    json: {
                        emailId: 'Test'+randomUserid+'_Email@dreamlion.com',
                        password: 'Test'+randomUserid+'_Email'
                    }
                };
                request(options, function(err, res) {
                    _servResponse = res.body;
                    user = _servResponse.user;
                    userid = user.userid;
                    token = _servResponse.token;
                    done();
                });
            });
            it('Should test worksheet summary fetch services with invalid request - no token', function(done){
                var _fetchOptions = {
                    url: 'http://localhost:8000/api/v1/worksheets/summary',
                    method: 'POST',
                    headers: {
                        "WM-TARGET": 'WM_SUMMARY'
                    }
                };
                request(_fetchOptions, function(err, res) {
                    done();
                });
            });
            it('Should test worksheet summary fetch services', function(done){
                var _fetchOptions = {
                    url: 'http://localhost:8000/api/v1/worksheets/summary',
                    method: 'POST',
                    headers: {
                        "WM-TARGET": 'WM_SUMMARY',
                        "X-ACCESS-TOKEN": token
                    }
                };
                request(_fetchOptions, function(err, res) {
                    done();
                });
            });
            it('Should test worksheet history fetch services', function(done){
                var _fetchOptions = {
                    url: 'http://localhost:8000/api/v1/worksheets/history',
                    method: 'POST',
                    headers: {
                        "WM-TARGET": 'WM_AUDIT',
                        "X-ACCESS-TOKEN": token
                    }
                };
                request(_fetchOptions, function(err, res) {
                    done();
                });
            });
            it('Should check for valid date to create worksheet', function(done){
                var _fetchOptions = {
                    url: 'http://localhost:8000/api/v1/worksheets/create',
                    method: 'POST',
                    headers: {
                        "WM-TARGET": 'WM_VALIDATE_DATE',
                        "X-ACCESS-TOKEN": token
                    },
                    json: {"workDate":workDate}
                };
                request(_fetchOptions, function(err, res) {
                    done();
                });
            });
            it('Should fail to update worksheet - no valid date', function(done){
                var _fetchOptions = {
                    url: 'http://localhost:8000/api/v1/worksheets/create',
                    method: 'POST',
                    headers: {
                        "WM-TARGET": 'WM_UPDATE',
                        "X-ACCESS-TOKEN": token
                    }
                };
                request(_fetchOptions, function(err, res) {
                    done();
                });
            });
            it('Should create worksheet', function(done){
                var _fetchOptions = {
                    url: 'http://localhost:8000/api/v1/worksheets/create',
                    method: 'POST',
                    headers: {
                        "WM-TARGET": 'WM_CREATE',
                        "X-ACCESS-TOKEN": token
                    },
                    json: {"status":"Saved","workDate":workDate,"workData":[{"fromTime":1461046000000,"toTime":1461055100000,"description":"test"}]}
                };
                request(_fetchOptions, function(err, res) {
                    done();
                });
            });
            it('Should create worksheet for existing date', function(done){
                var _fetchOptions = {
                    url: 'http://localhost:8000/api/v1/worksheets/create',
                    method: 'POST',
                    headers: {
                        "WM-TARGET": 'WM_CREATE',
                        "X-ACCESS-TOKEN": token
                    },
                    json: {"status":"Saved","workDate":workDate,"workData":[{"fromTime":1461046000000,"toTime":1461055100000,"description":"test"}]}
                };
                request(_fetchOptions, function(err, res) {
                    done();
                });
            });
            it('Should create worksheet -invalid data', function(done){
                var _fetchOptions = {
                    url: 'http://localhost:8000/api/v1/worksheets/create',
                    method: 'POST',
                    headers: {
                        "WM-TARGET": 'WM_CREATE',
                        "X-ACCESS-TOKEN": token
                    },
                    json: {"status":"Saved","workDate":workDate,"workData":[{"fromTime":new Date().getTime(),"toTime":workDate,"description":"test"}]}
                };
                request(_fetchOptions, function(err, res) {
                    done();
                });
            });
            it('Should fetch worksheet', function(done){
                var _fetchOptions = {
                    url: 'http://localhost:8000/api/v1/worksheets/details',
                    method: 'POST',
                    headers: {
                        "WM-TARGET": 'WM_FETCH',
                        "X-ACCESS-TOKEN": token
                    },
                    json: {"workDate":workDate}
                };
                request(_fetchOptions, function(err, res) {
                    done();
                });
            });
            it('Should fetch worksheet invalid time', function(done){
                var _fetchOptions = {
                    url: 'http://localhost:8000/api/v1/worksheets/details',
                    method: 'POST',
                    headers: {
                        "WM-TARGET": 'WM_FETCH',
                        "X-ACCESS-TOKEN": token
                    },
                    json: {"workDate":workDate+1}
                };
                request(_fetchOptions, function(err, res) {
                    done();
                });
            });
            it('Should fetch worksheet invalid date', function(done){
                var _fetchOptions = {
                    url: 'http://localhost:8000/api/v1/worksheets/details',
                    method: 'POST',
                    headers: {
                        "WM-TARGET": 'WM_FETCH',
                        "X-ACCESS-TOKEN": token
                    },
                    json: {"workDate":''}
                };
                request(_fetchOptions, function(err, res) {
                    done();
                });
            });
            it('Should fetch worksheet invalid target', function(done){
                var _fetchOptions = {
                    url: 'http://localhost:8000/api/v1/worksheets/details',
                    method: 'POST',
                    headers: {
                        "X-ACCESS-TOKEN": token
                    },
                    json: {"workDate":''}
                };
                request(_fetchOptions, function(err, res) {
                    done();
                });
            });
            it('Should check for valid date to create worksheet', function(done){
                var _fetchOptions = {
                    url: 'http://localhost:8000/api/v1/worksheets/create',
                    method: 'POST',
                    headers: {
                        "WM-TARGET": 'WM_VALIDATE_DATE',
                        "X-ACCESS-TOKEN": token
                    },
                    json: {"workDate":new Date().getTime()}
                };
                request(_fetchOptions, function(err, res) {
                    done();
                });
            });
            it('Should fail to create worksheet', function(done){
                var _fetchOptions = {
                    url: 'http://localhost:8000/api/v1/worksheets/create',
                    method: 'POST',
                    headers: {
                        "WM-TARGET": 'WM_CREATE',
                        "X-ACCESS-TOKEN": token
                    },
                    json: {}
                };
                request(_fetchOptions, function(err, res) {
                    done();
                });
            });
            it('Should fail to create/update worksheet - no target', function(done){
                var _fetchOptions = {
                    url: 'http://localhost:8000/api/v1/worksheets/create',
                    method: 'POST',
                    headers: {
                        "X-ACCESS-TOKEN": token
                    },
                    json: {}
                };
                request(_fetchOptions, function(err, res) {
                    done();
                });
            });
            it('Should fail to create/update worksheet - invalid target', function(done){
                var _fetchOptions = {
                    url: 'http://localhost:8000/api/v1/worksheets/create',
                    method: 'POST',
                    headers: {
                        "wm-target":"CREATE",
                        "X-ACCESS-TOKEN": token
                    },
                    json: {}
                };
                request(_fetchOptions, function(err, res) {
                    done();
                });
            });
            it('Should update worksheet', function(done){
                var _fetchOptions = {
                    url: 'http://localhost:8000/api/v1/worksheets/create',
                    method: 'POST',
                    headers: {
                        "WM-TARGET": 'WM_UPDATE',
                        "X-ACCESS-TOKEN": token
                    },
                    json: {"status":"Saved","workDate":new Date().getTime(),"workData":[{"fromTime":1461060000000,"toTime":1461090000000,"description":"test"}]}
                };
                request(_fetchOptions, function(err, res) {
                    done();
                });
            });
            it('Should fail to update worksheet - fromTime > toTime', function(done){
                var _fetchOptions = {
                    url: 'http://localhost:8000/api/v1/worksheets/create',
                    method: 'POST',
                    headers: {
                        "WM-TARGET": 'WM_UPDATE',
                        "X-ACCESS-TOKEN": token
                    },
                    json: {"status":"Saved","workDate":new Date().getTime(),"workData":[{"fromTime":1461055100000,"toTime":1461046000000,"description":"test"}]}
                };
                request(_fetchOptions, function(err, res) {
                    done();
                });
            });
            it('Should fail to update worksheet - fromTime > toTime', function(done){
                var _fetchOptions = {
                    url: 'http://localhost:8000/api/v1/worksheets/create',
                    method: 'POST',
                    headers: {
                        "WM-TARGET": 'WM_UPDATE',
                        "X-ACCESS-TOKEN": token
                    },
                    json: {"status":"Saved","workDate":new Date().getTime(),"workData":[{"fromTime":1461046000000,"toTime":1461055100000,"description":"test"},{"fromTime":1461046000000,"toTime":1461055100000,"description":"test"}]}
                };
                request(_fetchOptions, function(err, res) {
                    done();
                });
            });
            it('Should fail to update worksheet - fromTime > prevtoTime', function(done){
                var _fetchOptions = {
                    url: 'http://localhost:8000/api/v1/worksheets/create',
                    method: 'POST',
                    headers: {
                        "WM-TARGET": 'WM_UPDATE',
                        "X-ACCESS-TOKEN": token
                    },
                    json: {"status":"Saved","workDate":new Date().getTime(),"workData":[{"fromTime":1461046000000,"toTime":1461055100000,"description":"test"},{"fromTime":1461050000000,"toTime":1461055000000,"description":"test"}]}
                };
                request(_fetchOptions, function(err, res) {
                    done();
                });
            });
            it('Should fail to update worksheet - no work data', function(done){
                var _fetchOptions = {
                    url: 'http://localhost:8000/api/v1/worksheets/create',
                    method: 'POST',
                    headers: {
                        "WM-TARGET": 'WM_UPDATE',
                        "X-ACCESS-TOKEN": token
                    },
                    json: {"status":"Saved","workDate":new Date().getTime(),"workData":[]}
                };
                request(_fetchOptions, function(err, res) {
                    done();
                });
            });
            it('Should fail to update worksheet - invalid work data', function(done){
                var _fetchOptions = {
                    url: 'http://localhost:8000/api/v1/worksheets/create',
                    method: 'POST',
                    headers: {
                        "WM-TARGET": 'WM_UPDATE',
                        "X-ACCESS-TOKEN": token
                    },
                    json: {"status":"Saved","workDate":new Date().getTime(),"workData":[{}, {}]}
                };
                request(_fetchOptions, function(err, res) {
                    done();
                });
            });
            it('Should fail to update worksheet - no request body', function(done){
                var _fetchOptions = {
                    url: 'http://localhost:8000/api/v1/worksheets/create',
                    method: 'POST',
                    headers: {
                        "WM-TARGET": 'WM_UPDATE',
                        "X-ACCESS-TOKEN": token
                    },
                    json: {}
                };
                request(_fetchOptions, function(err, res) {
                    done();
                });
            });
            it('Should test worksheet history fetch services', function(done){
                var _fetchOptions = {
                    url: 'http://localhost:8000/api/v1/worksheets/history',
                    method: 'POST',
                    headers: {
                        "WM-TARGET": 'WM_AUDIT',
                        "X-ACCESS-TOKEN": token
                    },
                    json:{
                        fromDate: workDate-1,
                        toDate: workDate+1
                    }
                };
                request(_fetchOptions, function(err, res) {
                    done();
                });
            });
            it('Should test invalid API url', function(done){
                var _fetchOptions = {
                    url: 'http://localhost:8000/api/v1/test',
                    method: 'POST',
                    headers: {
                        "WM-TARGET": 'WM_SUMMARY',
                        "X-ACCESS-TOKEN": token
                    }
                };
                request(_fetchOptions, function(err, res) {
                    done();
                });
            });
            it('Should test invalid userid', function(done){
                var _fetchOptions = {
                    url: 'http://localhost:8000/api/v1/worksheets/history',
                    method: 'POST',
                    headers: {
                        "WM-TARGET": 'WM_AUDIT',
                        "X-KEY": "eyJ0eXAiOiJKV1QiLAkhbGciOiJIUzI1NiJ9.eyJlDYzMDEsInVzZXJpZCI6IjU3MDk3YTMzOTE3NjNhMDMwMDY2NzRiOSJ9.pg_rSfK8TwJtQAdGXabjdFASjgzZ-kLlOZHhEfh7bRA"
                    }
                };
                request(_fetchOptions, function(err, res) {
                    done();
                });
            });
            it('Should test invalid token', function(done){
                var _fetchOptions = {
                    url: 'http://localhost:8000/api/v1/worksheets/history',
                    method: 'POST',
                    headers: {
                        "WM-TARGET": 'WM_AUDIT',
                        "X-ACCESS-TOKEN": "e.y.OZHhPch7bRA"
                    }
                };
                request(_fetchOptions, function(err, res) {
                    done();
                });
            });
            it('Should test worksheet summary fetch services with invalid request - expired token', function(done){
                var _fetchOptions = {
                    url: 'http://localhost:8000/api/v1/worksheets/summary',
                    method: 'POST',
                    headers: {
                        "WM-TARGET": 'WM_SUMMARY',
                        "X-ACCESS-TOKEN": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE0NjEyMDI0MDYzMDEsInVzZXJpZCI6IjU3MDk3YTMzOTE3NjNhMDMwMDY2NzRiOSJ9.pg_rSfK8TwJtQAdGXabjdFASjgzZ-kLlOZHhEfh7bRA"
                    }
                };
                request(_fetchOptions, function(err, res) {
                    done();
                });
            });
            it('Should test invalid token', function(done){
                var _fetchOptions = {
                    url: 'http://localhost:8000/api/v1/summary',
                    method: 'POST',
                    headers: {
                        "WM-TARGET": 'WM_AUDIT',
                        "X-ACCESS-TOKEN": ""
                    }
                };
                request(_fetchOptions, function(err, res) {
                    done();
                });
            });
            it('Should fetch worksheet invalid target', function(done){
                var _fetchOptions = {
                    url: 'http://localhost:8000/api/v1/worksheets/summary',
                    method: 'POST',
                    headers: {
                        "X-ACCESS-TOKEN": token
                    },
                    json: {"workDate":''}
                };
                request(_fetchOptions, function(err, res) {
                    done();
                });
            });
        });
   });
});