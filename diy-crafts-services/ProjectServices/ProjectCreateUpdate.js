/**
 * Created by nithyarad on 10/14/16.
 */
'use strict';

(function(){
    var mongoProjectInst = require('../request-handler/MongoDB.js').project;
    var customResponseObj = require('../response-handler/custom-response-handling.js');
    var constants = require('../config/constants.js');
    var q = require('q');
    var moment = require('moment');
    var assert = require('assert');
    var createUpdateProject = {
        addProject:function(req, res){
            if(req && req.headers['x-diycrafts-target'] && (req.headers['x-diycrafts-target'] === 'DIYCRAFTS_CREATE' || req.headers['x-diycrafts-target'] === 'DIYCRAFTS_UPDATE')){
                var requestObj = req.body, self = this;
                if(requestObj){
                   var detailsObj = createUpdateProject.validateProjectDetails(requestObj), headerTarget= req.headers['x-diycrafts-target'];
                    if(detailsObj){
                        detailsObj = createUpdateProject.mapOptionalProjectDetails(requestObj, detailsObj);
                        if(detailsObj){
                            switch (headerTarget){
                                case 'DIYCRAFTS_CREATE':
                                    createUpdateProject.createNewProject(requestObj, detailsObj, res);
                                    break;
                                case 'DIYCRAFTS_UPDATE':
                                    createUpdateProject.createNewProject(requestObj, detailsObj, res, true);
                                    break;
                            }
                        }
                    }else{
                        customResponseObj.invalidRequest(res, 'Required parameters are missing');
                    }
                }else{
                    customResponseObj.invalidRequest(res);
                }
            }else{
                customResponseObj.targetError(res);
            }
        },
        notifySubscribers:function (projectDetails, req, res) {
            if (req && req.headers['x-diycrafts-target'] && (req.headers['x-diycrafts-target'] === 'DIYCRAFTS_CREATE')) {
                if (req.body && req.body.email && req.body.name && req.body.subject && req.body.comment) {
                    mailServices.sendMail(req.body.email, 'letscreate@diycraftsnme.com', req.body.subject, req.body.comment, req.body.name, res);
                } else {
                    customResponseObj.invalidRequest(res);
                }
            } else {
                customResponseObj.targetError(res);
            }

        },
        validateProjectDetails: function(details){
            var detailObj = {}, reqProp = constants.project.details;
            if(details){
                for(var rIndx in reqProp){
                    if(reqProp.hasOwnProperty(rIndx)){
                        var prop = reqProp[rIndx];
                        if(details[prop] === undefined){
                            return false;
                        }else{
                            detailObj[prop] = details[prop];
                        }
                    }
                }
            }
             return detailObj;
        },
        mapOptionalProjectDetails: function(requestObj, detailsObj){
            if(requestObj && detailsObj){
                var optionalProps = constants.project.details_optionals;
                for(var oIndx in optionalProps){
                    if(optionalProps.hasOwnProperty(oIndx)){
                        var prop = optionalProps[oIndx];
                        if(requestObj[prop]!== undefined){
                            detailsObj[prop] = requestObj[prop];
                        }
                    }
                }
            }
            return detailsObj;
        },
        createNewProject: function(requestObj, detailsObj, res, isUpdate){
            var self = this;
            if(requestObj && detailsObj && res){
                var savedProject = q.resolve(createUpdateProject.checkIfProjectExists(requestObj));
                savedProject.then(function(projectSaved){
                    if(!projectSaved){
                        var projects = q.resolve(createUpdateProject.getProjects());
                        projects.then(function(projectsList){
                            var projectIdNum = 1;
                           if(projectsList && projectsList.length > 0){
                               projectIdNum = projectsList.length;
                           }
                            detailsObj.publishDate = moment.utc().valueOf();
                            detailsObj.projectId = 'diy-'+projectIdNum;
                            var projectInst = mongoProjectInst(detailsObj);
                            projectInst.save([detailsObj], function(err, result){
                                if(result && result.projectId){
                                    res.status(200);
                                    res.json({
                                       projectId: result.projectId
                                    });
                                }
                            });
                        });
                    }else{
                        customResponseObj.invalidRequest(res, 'Project already exists');
                    }
                });
            }
        },
        checkIfProjectExists: function(requestObj){
            if(requestObj && requestObj.projectId){
                var deferred = q.defer(), matchedProjectInst;
                var validateDate = mongoProjectInst.find({projectId: requestObj.projectId, videoId: requestObj.videoId}, function (err, items) {
                    if (assert.equal(null, err) || (items && items.length === 0)) {
                        return false;
                    } else if (items && items.length > 0) {
                        matchedProjectInst = items[0];
                    }
                    deferred.resolve(matchedProjectInst);
                });
                return deferred.promise;
            }else{
                return false;
            }
        },
        getProjects: function(){
            var deferred = q.defer(), projectsList = [];
            mongoProjectInst.find({}, function(err, items){
                if(assert.equal(null, err) || items && items.length === 0){
                    projectsList = [];
                }else if(items && items.length > 0){
                    projectsList = items;
                }
                deferred.resolve(projectsList);
            });
            return deferred.promise;
        }
    };
    module.exports = createUpdateProject;
})();