const express = require('express');
const authController = require('../controllers/auth');
const { body } = require('express-validator');

//Router setup
const router = express.Router();

//Get Login Router
router.get('/login', authController.getLogin);

//Post Login Router
router.post('/login',[ 
body('username', 'Tài khoản tối thiểu 6 ký tự.')
.isString()
.isLength({min: 6}),
body('password', 'Mật khẩu tối thiểu 6 ký tự.')
.isString()
.isLength({min: 6})
],
authController.postLogin);

//Logout the user
router.post('/logout', authController.postLogout);

module.exports = router;