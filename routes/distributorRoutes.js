const express = require('express');
const router = express.Router();
const {uploadDistributorImage} = require('../middlewares/multer');
const deleteDistributorsimages = require('../middlewares/deleteDistributorsimages');
const {distributorValidationRules, validateDistributor } = require('../valitadors/DistributorValidator');

// Distributors routes
const Distributorscontroller = require('../controller/Distributorscontroller');

router.post('/addDistributor',uploadDistributorImage, distributorValidationRules(), validateDistributor, Distributorscontroller.addDistributor );// Add new distributor

router.get('/getAllDistributors', Distributorscontroller.getAllDistributors ); //Get all distributors

router.get('/getDistributorById/:id', Distributorscontroller.getDistributorById ); // Get distriboutor by id for distributor's details

router.get('/searchDistributor', Distributorscontroller.searchDistributors);

router.put('/updateDistributorById/:id', uploadDistributorImage, deleteDistributorsimages, Distributorscontroller.updateDistributor ); // update distributors details by id

router.delete('/deleteDistributorById/:id', deleteDistributorsimages, Distributorscontroller.deleteDistributor ); // detele distributor by id

module.exports = router;