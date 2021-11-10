var express = require('express');
var router = express.Router();

/* GET accounts listing. */
router.get('/', function(req, res, next) {
  res.send('accounts page');
});

module.exports = router;
