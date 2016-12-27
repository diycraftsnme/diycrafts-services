var express = require('express');
var router = express.Router();
var auth = require('./auth.js');
var users = require('./users.js');
var projects = require('./projects.js');
/*
 * Routes that can be accessed by any one
 */
router.post('/login', auth.login);
router.post('/signup', auth.signup);
router.get('/test', users.test);
/*
 * Routes that can be accessed only by autheticated users
 */
router.get('/api/v1/projects/projectsList', projects.fetch);
router.get('/api/v1/projects/myProjects', projects.myProjects);
router.get('/api/v1/projects/memberProjects', projects.memberProjects);
router.get('/api/v1/projects/details', projects.read);
router.get('/api/v1/projects/latest', projects.getLatest);
router.post('/api/v1/projects/create', projects.create);
router.post('/api/v1/projects/upload/image', projects.uploadImage);
router.post('/api/v1/users/suggest', users.suggestContact);
router.post('/api/v1/users/contact', users.suggestContact);
router.post('/api/v1/users/subscribe', users.subscribe);
router.get('/api/v1/users/unSubscribe/:userId', users.unSubscribe);

module.exports = router;