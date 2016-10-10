(function() {
var projectList = require('../ProjectServices/ProjectList.js').read;
var projectDetails = require('../ProjectServices/ProjectDetails.js').fetch;
var projectLatest = require('../ProjectServices/ProjectList.js').getLatest;
var projects = {

    read: function(req, res) {
        projectList(req, res);
    },

    fetch: function(req, res) {
        projectDetails(req, res);
    },

    getLatest: function(req, res){
        projectLatest(req, res);
    }
};

module.exports = projects;
})();