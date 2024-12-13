const express = require('express');
const AdminController = require('../controller/Admincontroller');
const {uploadAdminProfile} = require('../middlewares/multer');
const router = express.Router();

router.put('/admin/:id', uploadAdminProfile, AdminController.updateAdminProfile);

router.get('/admin/:id', AdminController.getAdminProfile);

// Admin Search Route
router.post('/admin/search', AdminController.searchAdminByEmail);

// Admin Password Reset Route
router.post('/admin/reset-password', AdminController.updateAdminPassword);

module.exports = router;