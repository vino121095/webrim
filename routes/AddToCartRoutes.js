const express = require('express');
const router = express.Router();
const {addToCartValidationRules, validateAddToCart, updateCartValidator} = require('../valitadors/AddtocartValidator');

// cart routes
const Addtocartcontroller = require('../controller/Addtocartcontroller');

router.post('/addtocart', addToCartValidationRules(), validateAddToCart, Addtocartcontroller.addToCart); // Add to cart products

router.get('/user/:id', Addtocartcontroller.getCartItems); // Get user's cart

router.put('/update/:id', updateCartValidator(), validateAddToCart, Addtocartcontroller.updateCartQuantity); // Update cart item quantity

router.delete('/remove/:id', Addtocartcontroller.removeFromCart); // Remove item from cart

module.exports = router;