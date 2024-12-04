const express = require('express');
const router = express.Router();
const {uploadProductImages} = require('../middlewares/multer');
const generateProductId = require('../middlewares/generateProductid');
const deleteOldImages = require('../middlewares/deleteoldimages');
const {productValidationRules, validateProduct} = require('../valitadors/ProductValidator');

const productController = require('../controller/Productcontroller');

router.post('/addProduct', uploadProductImages, productValidationRules(), validateProduct, generateProductId, productController.addProduct );// Add new product

router.get('/getAllProducts', productController.getAllProducts); //Get all products

router.get('/productDetail/:id', productController.getProductById); //Get product by id for product detail

router.put('/updateproduct/:id', uploadProductImages, deleteOldImages, productController.updateProduct);

router.delete('/deleteProductById/:id', deleteOldImages, productController.deleteProduct); // Delete product by ID

module.exports=router;