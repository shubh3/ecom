const express = require('express')
const router = express.Router()

const {signup,login,logout,forgotpassword, passwordreset,
    getLoggedInUserDetails,changePassword,updateUserDetails,
    adminAllUser,adminSingleUser, adminUserUpdate, adminUserDelete
      } = require('../controller/userController');
const { isLoggedIn,customRole } = require('../middleware/userMiddleware');


router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/forgotpassword').post(forgotpassword);
router.route('/password/reset/:token').post(passwordreset);
router.route('/userdashboard').get(isLoggedIn, getLoggedInUserDetails);
router.route('/password/update').post(isLoggedIn,changePassword);


router.route('/userdashboard/update').post(isLoggedIn,updateUserDetails);
router.route('/admin/users').get(isLoggedIn,customRole('admin'),adminAllUser);
router.route('/admin/users/:id').get(isLoggedIn,customRole('admin'),adminSingleUser);
router.route('/admin/users/:id').put(isLoggedIn,customRole('admin'),adminUserUpdate);
router.route('/admin/users/:id').delete(isLoggedIn,customRole('admin'),adminUserDelete);
module.exports = router;