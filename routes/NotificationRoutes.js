const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/NotificationController');

router.get('/notifications', notificationController.getAllNotifications);
router.put('/notifications/:notificationId/read', notificationController.markAsRead);
router.get('/notifications/unread-count', notificationController.getUnreadCount);

module.exports = router;