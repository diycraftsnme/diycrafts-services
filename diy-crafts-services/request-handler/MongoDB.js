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
        "password": String
    });
    var projectSchema = new mongoSchema({
        "projectId": String,
        "name": String,
        "description":  String,
        "materialsRequired": Array,
        "procedure": Array,
        "publishDate": Number,
        "photoGuideAvailable": Boolean,
        "videoGuideAvailable": Boolean,
        "videoUrl": String,
        "videoId": String,
        "urlName": String,
        "thumbnailName": String,
        "className": String,
        "tags": String
    });
    var dbSchema = {
        "user":  mongoose.model('Users',userSchema),
        "project": mongoose.model('Projects', projectSchema)
    };
// create model if not exists.
    module.exports = dbSchema;
})();