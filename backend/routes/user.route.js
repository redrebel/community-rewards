var express = require('express');
var validate = require('express-validation');
var expressJwt = require('express-jwt');
var paramValidation = require('../config/param-validation');
var config = require('../config/config');
var userCtrl = require('../controllers/user.controller');

const router = express.Router(); // eslint-disable-line new-cap
const auth = expressJwt({secret: config.jwtSecret, requestProperty: 'decoded'})

router.route('/')
  /** GET /api/users - Get users */
  .get(auth, userCtrl.list)
  /** POST /api/users - Create user */
  .post(auth, validate(paramValidation.createUser), userCtrl.create);

// need refactoring
router.route('/active')
  .get(auth, userCtrl.activeList)

// need refactoring
router.route('/address')
  .get(auth, userCtrl.addressList)
    
router.route('/me')
  /** GET /api/users/me - Get current user */
  .get(auth, function(req, res, next){
    userCtrl.load(req, res, next, req.decoded._id)
  }, userCtrl.get)
  /** PUT /api/users/me - Update current user */
  .put(auth, function(req, res, next){
    userCtrl.load(req, res, next, req.decoded._id)
  }, userCtrl.update)

router.route('/token')
  /** GET /api/users/:userId/token - Get user token */
  .get(auth, userCtrl.getMyToken)

router.route('/:userId')
  /** GET /api/users/:userId - Get user */
  .get(auth, userCtrl.get)

  /** PUT /api/users/:userId - Update user */
  .put(auth, validate(paramValidation.updateUser), userCtrl.update)

  /** DELETE /api/users/:userId - Delete user */
  .delete(auth, userCtrl.remove);

router.route('/:userId/token')
  /** GET /api/users/:userId/token - Get user token */
  .get(auth, userCtrl.getToken)

/** Load user when API with userId route parameter is hit */
router.param('userId', userCtrl.load);

module.exports = router;