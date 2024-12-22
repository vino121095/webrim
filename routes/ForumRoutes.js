const express = require('express');
const { forumValidationRules, validateForum } = require('../valitadors/ForumValidator');
const router = express.Router();

const ForumController = require('../controller/ForumController');
// Route to add a new forum
router.post('/forum', ForumController.addForum);

// Route to view all forums
router.get('/forums', ForumController.viewForums);

router.put('/forum/:id', forumValidationRules(), validateForum, ForumController.updateForum);

router.delete('/forum/:id', ForumController.deleteForum);

router.post('/forumtake/:fid', ForumController.takeForum);

router.get('/forumtakens/:id', ForumController.showNotifyForDistributor);

router.get('/forumtakes/:id', ForumController.showNotifyForTechnician);

router.get('/forumtakebyid/:id', ForumController.getForumTakesByIdemId);

module.exports = router;
