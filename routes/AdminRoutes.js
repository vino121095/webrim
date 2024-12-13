const express = require('express');
const AdminController = require('../controller/Admincontroller');
const router = express.Router();

// Admin Search Route
router.post('/admin/search', AdminController.searchAdminByEmail);

// Admin Password Reset Route
router.post('/admin/reset-password', AdminController.updateAdminPassword);

module.exports = router;