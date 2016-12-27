/**
 * Created by nithyarad on 10/8/16.
 */
(function(){
    var constants = require('../config/constants.js');
    var q = require('q');
    var mongoProjectInst = require('../request-handler/MongoDB.js').project;
    var mongoMemberProjectInst = require('../request-handler/MongoDB.js').memberProject;
    var assert = require('assert');
    var customResponseObj = require('../response-handler/custom-response-handling.js');
    var projectList = {
        getLatest: function(req, res){
            if(req && req.headers['x-diycrafts-target'] && req.headers['x-diycrafts-target'] === 'GET_LATEST'){
                if(req.body && req.body.projectCount){
                    projectList.getProjects(res,mongoProjectInst, {}, req.body.projectCount);
                }else{
                    customResponseObj.invalidRequest(res, 'Project count is required');
                }
            }else{
                customResponseObj.targetError(res);
            }

        },
        getAllProjects: function(req, res){
            if(req && req.headers['x-diycrafts-target'] && req.headers['x-diycrafts-target'] === 'GET_PROJECTS'){
                if(req.headers['x-diycrafts-mode'] && req.headers['x-diycrafts-mode'] === 'MEMBER' && req.userDetails){
                    projectList.getProjects(res, mongoProjectInst, {creatorId: req.userDetails.id});
                }else if(!req.userDetails){
                    projectList.getProjects(res, mongoProjectInst, {});
                }
            }else{
                customResponseObj.targetError(res);
            }
        },
        getAllMemberProjects: function(req, res){
            if(req && req.headers['x-diycrafts-target'] && req.headers['x-diycrafts-target'] === 'GET_MEMBER_PROJECTS' && req.userDetails && req.userDetails.id === constants.superAdminId){
                projectList.getProjects(res,mongoMemberProjectInst, {});
            }else{
                customResponseObj.unAuthorizedError(res);
            }
        },
        getAllMyProjects: function(req, res){
            if(req && req.headers['x-diycrafts-target'] && req.headers['x-diycrafts-target'] === 'GET_MY_PROJECTS' && req.userDetails && req.userDetails.id === constants.superAdminId){
                projectList.getProjects(res,mongoProjectInst, {creatorId: req.userDetails.id});
            }else{
                customResponseObj.unAuthorizedError(res);
            }
        },
        readProject: function(req, res){
            if(req && req.headers['x-diycrafts-target'] && req.headers['x-diycrafts-target'] === 'READ_PROJECT'){
                if(req.body && req.body.projectId){
                    var query = {
                      projectId: req.body.projectId  
                    };
                    this.getProjects(res, query);
                }else{
                    customResponseObj.invalidRequest(res, 'ProjectId is required');
                }
            }else{
                customResponseObj.targetError(res);
            }
        },

        getProjects: function(res,projectInst, _query, _limit){
            var query = {}, limit = _limit;
            var queryOptions = {
                sort: ['publishDate']
            };
            if(_query){
                query = _query;
            }
            if(limit){
                projectInst.collection.find(query,queryOptions).limit(_limit).toArray(function(err, results){
                    if(assert.equal(null, err)){
                        customResponseObj.serverError(res);
                    }else{
                        customResponseObj.successResponse(res, results);
                    }

                });
            }else{
                projectInst.collection.find(query,queryOptions).toArray(function(err, results){
                    if(assert.equal(null, err)){
                        customResponseObj.serverError(res);
                    }else{
                        customResponseObj.successResponse(res, results);
                    }

                });
            }
        }
    };
    module.exports = projectList;

})();