const express = require('express')
const router = express.Router()
const {home} = require('../controller/homeController.js')


router.route('/').get(home);

module.exports = router;