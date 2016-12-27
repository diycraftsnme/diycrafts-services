(function() {
// Retrieve
    var mongoose =  require("mongoose");
    mongoose.connect('mongodb://diycraftsnme:O8o62o14@ds053166.mlab.com:53166/master_diycraftsnme');
    // create instance of Schema
    var mongoSchema =   mongoose.Schema;
    // create schema
    var userSchema  = new mongoSchema({
        "email" : String,
        "firstName" : String,
        "lastName" : String,
        "password": String,
        "lastProjectUploadDate":Number
    });
    var procedureSchema = new mongoSchema({
        "operation": String,
        "photo": Array
    });
    var projectSchema = new mongoSchema({
        "projectId": String,
        "name": String,
        "description":  String,
        "materialsRequired": Array,
        "procedure": [procedureSchema],
        "publishDate": Number,
        "photoGuideAvailable": Boolean,
        "videoGuideAvailable": Boolean,
        "videoUrl": String,
        "videoId": String,
        "urlName": String,
        "thumbnailName": String,
        "className": String,
        "tags": String,
        "createdBy": String,
        "approved": Boolean,
        "active": Boolean,
        "creatorId": String
    });
    var dbSchema = {
        "user":  mongoose.model('Users',userSchema),
        "project": mongoose.model('Projects', projectSchema),
        "memberProject": mongoose.model('Projects', projectSchema)
    };
// create model if not exists.
    module.exports = dbSchema;
})();