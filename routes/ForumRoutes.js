const express = require('express');
const { forumValidationRules, validateForum } = require('../valitadors/ForumValidator');
const router = express.Router();

const ForumController = require('../controller/ForumController');
// Route to add a new forum
router.post('/forum', forumValidationRules(), validateForum, ForumController.addForum);

// Route to view all forums
router.get('/forums', ForumController.viewForums);

router.post('/forumtake/:id', ForumController.takeForum);

router.get('/forumtakens/:id', ForumController.showNotifyForDistributor);

router.get('/forumtakes/:id', ForumController.showNotifyForTechnician);

module.exports = router;
