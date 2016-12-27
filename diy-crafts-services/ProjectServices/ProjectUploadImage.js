/**
 * Created by nithyarad on 12/16/16.
 */
(function(){
    var constants = require('../config/constants.js');
    var customResponseObj = require('../response-handler/custom-response-handling.js');
    var Client = require('ssh2').Client;
    var fs = require('ssh2-fs');
    var formidable = require('formidable');
    var assert = require('assert');
    var moment = require('moment');
    var test_fs = require('fs');
    var Jimp = require("jimp");
    var projectUploadImage = {
        uploadImage: function(req, res){
            if(req && req.headers['x-diycrafts-target'] && req.headers['x-diycrafts-target'] === 'PROJECT_IMAGE'){
                var form = new formidable.IncomingForm();

                form.parse(req, function (err, fields, files) {
                    if(assert.equal(null, err)){
                        customResponseObj.serverError(res);
                    }
                });
                form.on('end', function(fields, files) {
                    var currFile = this.openedFiles[0];
                    var fileSize = currFile.size;
                    console.log(fileSize);
                    if(fileSize > constants.imageMaxSize){
                        projectUploadImage.reduceImageQuality(res, currFile);
                    }else{
                        projectUploadImage.saveImageToRemote(currFile, res);
                    }

                });
            }
        },
        reduceImageQuality: function(res, currentFile){
            if(currentFile && res){
                /* Temporary location of our uploaded file */
                var temp_path = currentFile.path;
                /* The file name of the uploaded file */
                var file_name = currentFile.name;
                var fileSize = currentFile.size;
                if(fileSize > constants.imageMaxSize){
                    console.log('Image size greater than threshold');
                    var fileQuality = projectUploadImage.getFileQuality(fileSize);
                    Jimp.read(temp_path, function (err, testimage) {
                        test_fs.mkdir('temp_upload', function(){
                            testimage.quality(fileQuality).write('temp_upload/'+file_name, function(err, writeSuc){

                                console.log(err);
                                console.log(writeSuc);
                            });
                            projectUploadImage.saveImageToRemote(currentFile, res, true);
                        });
                    });
                }else{
                    console.log('Image size less than threshold');
                    projectUploadImage.saveImageToRemote(currentFile, res);
                }
            }

        },
        getFileQuality: function(fileSize){
            var qualDeg = Math.abs((100 * constants.imageMaxSize)/fileSize);
            return Math.ceil(qualDeg);

        },
        getUploadFileName: function(){
            var dateTime = moment.utc().valueOf().toString(), uniqueHash = Math.random().toString().slice(2,11);
            console.log('Generated Id: '+ dateTime + '_'+ uniqueHash);
            return dateTime + '_'+ uniqueHash;
        },
        saveImageToRemote: function(currentFile, res, isFileModified){
            if(currentFile && res){
                /* Location where we want to copy the uploaded file */
                var currDateDirName = moment().format('DD-MM-YYYY');
                var remote_location = 'image_uploads/'+currDateDirName;
                var file_name = currentFile.name;
                var fileName = projectUploadImage.getUploadFileName();
                var fileType = currentFile.type.split('/');
                var fileExt = fileType[fileType.length -1];
                var fileReadPath = currentFile.path;
                if(isFileModified){
                    fileReadPath = 'temp_upload/'+file_name;
                }
                var conn = new Client();
                conn.on('ready', function() {
                    console.log('Client :: ready');
                    fs.mkdir(conn, '/image_uploads/'+currDateDirName, function(err, stdout, stderr){
                        conn.sftp(
                            function (err, sftp) {
                                if ( err ) {
                                    console.log( "Error, problem starting SFTP: %s", err );
                                    process.exit( 2 );
                                }
                                console.log( "- SFTP started" );

                                // upload file
                                var uploadFilePath = remote_location + '/'+ fileName + '.'+fileExt;
                                var readStream = test_fs.createReadStream(fileReadPath);
                                var writeStream = sftp.createWriteStream(uploadFilePath);

                                // what to do when transfer finishes
                                writeStream.on('close', function () {
                                    console.log( "- file transferred" );
                                    if(isFileModified){
                                        test_fs.unlink('temp_upload/'+file_name);
                                    }
                                    customResponseObj.successResponse(res, {
                                        uploadPath: uploadFilePath,
                                        message: "Image uploaded successfully"
                                    });
                                    sftp.end();
                                });
                                readStream.on('open', function () {
                                    // initiate transfer of file
                                    readStream.pipe( writeStream );
                                });

                                // This catches any errors that happen while creating the readable stream (usually invalid names)
                                readStream.on('error', function(err) {
                                    customResponseObj.serverError(res);
                                });

                            }
                        );
                    });

                }).connect({
                    host: 'home639690963.1and1-data.host',
                    username: 'u85896333',
                    password: 'O8o62o14'
                });
            }


        }
    };
    module.exports = projectUploadImage;

})();