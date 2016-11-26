(function() {
var projectDetails = require('../ProjectServices/ProjectList.js').readProject;
var projectList = require('../ProjectServices/ProjectList.js').getAllProjects;
var projectLatest = require('../ProjectServices/ProjectList.js').getLatest;
var projectCreate = require('../ProjectServices/ProjectCreateUpdate.js').addProject;
var projects = {

    read: function(req, res) {
        projectDetails(req, res);
    },

    fetch: function(req, res) {
        projectList(req, res);
    },

    getLatest: function(req, res){
        projectLatest(req, res);
    },
    
    create: function(req, res){
        projectCreate(req, res);
    }
};

module.exports = projects;
})();