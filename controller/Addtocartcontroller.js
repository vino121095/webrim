const User = require('../model/UserModel');
const Products = require('../model/Productmodel');
const AddToCart = require('../model/AddToCartModel');
const ProductImages =require('../model/productImagesmodel');
// Add a product to the cart
exports.addToCart = async (req, res) => {
  const { 
    user_id, 
    product_id, 
    product_name, 
    quantity, 
    distributor_name, 
    // distributor_location, 
    phone_number 
  } = req.body;

  try {
    // Validate user
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Validate product
    const product = await Products.findOne({ 
      where: { 
        product_id: product_id, 
        product_name: product_name 
      }
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Check if item already exists in cart
    const existingCartItem = await AddToCart.findOne({
      where: { 
        user_id, 
        product_id 
      }
    });

    let cartItem;
    if (existingCartItem) {
      // Update quantity if item already exists
      existingCartItem.quantity += quantity;
      cartItem = await existingCartItem.save();
    } else {
      // Create new cart item
      cartItem = await AddToCart.create({ 
        user_id, 
        product_id, 
        product_name,
        quantity, 
        distributor_name, 
        // distributor_location, 
        phone_number 
      });
    }

    return res.status(201).json(cartItem);
  } catch (error) {
    console.error('Add to Cart Error:', error);
    return res.status(500).json({ 
      message: 'Error adding to cart.', 
      error: error.message 
    });
  }
};
 
// Get all cart items for a user
exports.getCartItems = async (req, res) => {
  const user_id = req.params.id;
 
  try {
      const cartItems = await AddToCart.findAll({
          where: { user_id: user_id },
          include: [
              {
                  model: User,
                  as: 'user', // Use the alias defined in associations
                  attributes: ['uid', 'username']
              },
              {
                  model: Products,
                  as: 'product', // Use the alias defined in associations
                  attributes: ['product_id', 'product_name', 'mrp_rate', 'brand_name', 'distributors_rate'],
                  include: [
                      {
                          model: ProductImages,
                          as: 'images', // Use the alias defined in associations
                          attributes: ['image_path']
                      }
                  ]
              }
          ],
          raw: false // Allow nested data
      });
 
      if (cartItems.length === 0) {
          return res.json({ message: 'No cart items found for this user.' });
      }
 
      // Process and return data
      const processedCartItems = cartItems.map(cartItem => {
          const product = cartItem.product;
          const firstImage = product.images && product.images[0] ? product.images[0].image_path : null;
          return {
              ...cartItem.toJSON(),
              product: {
                  ...product.toJSON(),
                  firstImage : firstImage
              }
          };
      });
 
      res.status(200).json(processedCartItems);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching cart items.', error: error.message });
  }
};
 
 
// Update cart item quantity
exports.updateCartQuantity = async (req, res) => {
  const cart_id = req.params.id;
  const { quantity } = req.body;
 
  try {
    const cartItem = await AddToCart.findByPk(cart_id);
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found.' });
    }
 
    cartItem.quantity = quantity;
    await cartItem.save();
 
    return res.status(200).json(cartItem);
  } catch (error) {
    return res.status(500).json({ message: 'Error updating cart item.', error });
  }
};
 
// Remove a product from the cart
exports.removeFromCart = async (req, res) => {
  const cart_id = req.params.id;
 
  try {
    const cartItem = await AddToCart.findByPk(cart_id);
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found.' });
    }
 
    await cartItem.destroy();
    return res.status(200).json({ message: 'Cart item removed.' });
  } catch (error) {
    return res.status(500).json({ message: 'Error removing cart item.', error });
  }
};