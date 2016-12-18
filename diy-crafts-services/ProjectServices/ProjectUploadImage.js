/**
 * Created by nithyarad on 12/16/16.
 */
(function(){
    var constants = require('../config/constants.js');
    var customResponseObj = require('../response-handler/custom-response-handling.js');
    var Client = require('ssh2').Client;
    var fs = require('ssh2-fs');
    var projectUploadImage = {
        uploadImage: function(req, res){

            var conn = new Client();
            conn.on('ready', function() {
                console.log('Client :: ready');
                fs.mkdir(conn, '/image_uploads/tmp', function(err, stdout, stderr){
                    console.log(stdout);
                    res.status(200);
                    res.json({
                        message: 'Image uploaded successfully'
                    });
                });

            }).connect({
                host: 'home639690963.1and1-data.host',
                username: 'u85896333',
                password: 'O8o62o14'
            });
        }
    };
    module.exports = projectUploadImage;

})();