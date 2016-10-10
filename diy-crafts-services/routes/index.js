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
router.post('/api/v1/projects/projectsList', projects.read);
router.post('/api/v1/projects/details', projects.fetch);
router.post('/api/v1/projects/latest', projects.getLatest);
router.post('/api/v1/users/suggest', users.suggestContact);
router.post('/api/v1/users/contact', users.suggestContact);
router.post('/api/v1/users/subscribe', users.subscribe);
router.post('/api/v1/users/unSubscribe', users.unSubscribe);

module.exports = router;