/**
 * Created by nithyarad on 10/14/16.
 */
'use strict';

(function(){
    var mongoProjectInst = require('../request-handler/MongoDB.js').project;
    var mongoMemberProjectInst = require('../request-handler/MongoDB.js').memberProject;
    var customResponseObj = require('../response-handler/custom-response-handling.js');
    var constants = require('../config/constants.js');
    var q = require('q');
    var moment = require('moment');
    var assert = require('assert');
    var mailServices = require('../UserServices/mail-services.js');
    var createUpdateProject = {
        addProject:function(req, res){
            if(req && req.headers['x-diycrafts-target'] && (req.headers['x-diycrafts-target'] === 'DIYCRAFTS_CREATE' || req.headers['x-diycrafts-target'] === 'DIYCRAFTS_UPDATE')){
                var requestObj = req.body, self = this;
                if(requestObj){
                   var detailsObj = createUpdateProject.validateProjectDetails(requestObj), headerTarget= req.headers['x-diycrafts-target'];
                    if(detailsObj){
                        detailsObj = createUpdateProject.mapProjectDetails(requestObj, detailsObj, constants.project.details_optionals);
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
        mapProjectDetails: function(requestObj, detailsObj, fieldLookUp){
            if(requestObj && detailsObj && fieldLookUp){
                for(var oIndx in fieldLookUp){
                    if(fieldLookUp.hasOwnProperty(oIndx)){
                        var prop = fieldLookUp[oIndx];
                        if(requestObj[prop]!== undefined){
                            detailsObj[prop] = requestObj[prop];
                        }
                    }
                }
            }
            if(requestObj.userDetails){
                detailsObj.createdBy = '';
                if(requestObj.userDetails.firstName){
                    detailsObj.createdBy += requestObj.userDetails.firstName;
                }
                if(requestObj.userDetails.lastName){
                    detailsObj.createdBy += ' ' + requestObj.userDetails.lastName;
                }
                if(requestObj.userDetails.id){
                    detailsObj.creatorId = requestObj.userDetails.id;
                }
            }
            detailsObj.approved = false;
            return detailsObj;
        },
        createNewProject: function(requestObj, detailsObj, res, isUpdate){
            var self = this;
            if(requestObj && detailsObj && res){
                var savedProject = q.resolve(createUpdateProject.checkIfProjectExists(requestObj));
                savedProject.then(function(projectSaved){
                    if(!projectSaved){
                        if(isUpdate){
                            customResponseObj.invalidRequest(res, 'Project does not exist to update'); 
                        }else{
                            var projects = q.resolve(createUpdateProject.getProjects());
                            projects.then(function(projectsList){
                                var projectIdNum = 1;
                                if(projectsList && projectsList.length > 0){
                                    projectIdNum = projectsList.length;
                                }
                                detailsObj.publishDate = moment.utc().valueOf();
                                detailsObj.projectId = 'diy-'+projectIdNum;
                                var projectInst = mongoMemberProjectInst(detailsObj);
                                projectInst.save([detailsObj], function(err, result){
                                    if(result && result.projectId){
                                        res.status(200);
                                        res.json({
                                            projectId: result.projectId,
                                            message: 'Project Submitted successfully'
                                        });
                                    }
                                });
                            });
                        }
                    }else{
                        if(isUpdate && requestObj.projectId && projectSaved && projectSaved.projectId === requestObj.projectId){
                            createUpdateProject.mapProjectDetails(requestObj, detailsObj, constants.project.update_required);
                            var projectInst = mongoProjectInst(detailsObj);
                            projectInst.collection.replaceOne({projectId: requestObj.projectId}, detailsObj, function(err, result){
                                if(result && result.matchedCount && result.matchedCount === 1){
                                    res.status(200);
                                    res.json({
                                        projectId: requestObj.projectId,
                                        message: "Project updated successfully"
                                    });
                                }
                            });
                        }else{
                            customResponseObj.invalidRequest(res, 'Project already exists');
                        }
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
        },
        approveRejectProject: function(req, res){
            if(req && req.headers['x-diycrafts-target'] && req.headers['x-diycrafts-target'] === 'PROJECT_APPROVAL' && req.userDetails && req.userDetails.id === constants.superAdminId){
                var requestObj = req.body;
                if(requestObj && requestObj.projectId && requestObj.approved !== undefined){
                    var query = {
                        projectId: requestObj.projectId
                    };
                    var queryOptions = {
                        sort: ['publishDate']
                    };
                    mongoMemberProjectInst.collection.find(query,queryOptions).limit(1).toArray(function(err, results){
                        if(assert.equal(null, err)){
                            customResponseObj.serverError(res);
                        }else{
                            if(results && results.length === 1){
                                var memberProject = results[0];
                                if(memberProject){
                                    delete memberProject.id;
                                }
                                memberProject.approved = requestObj.approved;
                                var approvalStatus = requestObj.approved? 'Approved': 'Rejected';
                                var projectInst = mongoProjectInst(memberProject);
                                projectInst.save([memberProject], function(err, result){
                                    mongoMemberProjectInst.collection.remove({projectId: requestObj.projectId}, {justOne: true});
                                    var substitutionObj = {
                                        name: req.userDetails.name,
                                        projectName: memberProject.name,
                                        shortDescription: memberProject.description
                                    };
                                    var mailObj = {
                                        fromEmail: 'letscreate@diycraftsnme.com',
                                        toEmail: req.userDetails.email,
                                        subject: 'Congrats, Your video is now published in diycraftsnme.com',
                                        subscriberId: req.userDetails.id
                                    };
                                    mailServices.sendMail(res, mailObj, 'publish_success', substitutionObj);
                                    if(result && result.projectId){
                                        res.status(200);
                                        res.json({
                                            projectId: result.projectId,
                                            message: 'Project '+ approvalStatus + ' successfully'
                                        });
                                    }else{
                                        customResponseObj.serverError(res);
                                    }
                                });
                            }else{
                                customResponseObj.serverError(res);
                            }
                        }

                    });
                }else{
                    customResponseObj.invalidRequest(res, 'Project Id and approval status is required');
                }
            }else{
                customResponseObj.unAuthorizedError(res);
            }
        }
    };
    module.exports = createUpdateProject;
})();