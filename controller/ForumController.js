const { where, Sequelize, Transaction } = require('sequelize');
const Forum = require('../model/ForumModel');
const ForumProduct = require('../model/ForumProductModel');
const ForumTake = require('../model/ForumTakesModel');
const User = require('../model/UserModel');
const Product = require('../model/Productmodel');
const cron = require('node-cron');

// Add a new forum with multiple products
const addForum = async (req, res) => {
  const transaction = await Forum.sequelize.transaction();
  
  try {
    const { name, phone_number, close_date, products, user_id } = req.body;

    // Validate required fields
    if (!name || !phone_number || !close_date || !products || !user_id) {
      throw new Error('Missing required fields');
    }

    // Validate products array
    if (!Array.isArray(products) || products.length === 0) {
      throw new Error('Products must be a non-empty array');
    }

    // Create the main forum entry
    const forum = await Forum.create({
      user_id,
      name,
      phone_number,
      close_date,
      status: 'Not Taken'
    }, { transaction });

    // Create entries for each product
    const forumProducts = await Promise.all(
      products.map(async (product) => {
        // Validate product data
        if (!product.product_id || !product.product_name || !product.quantity) {
          throw new Error('Invalid product data');
        }

        return ForumProduct.create({
          forum_id: forum.fid,
          product_id: product.product_id,
          product_name: product.product_name,
          quantity: product.quantity,
          status: 'Not Taken'
        }, { transaction });
      })
    );

    await transaction.commit();

    return res.status(201).json({
      message: 'Forum created successfully',
      data: {
        forum,
        products: forumProducts
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating forum:', error);
    return res.status(400).json({
      message: 'Failed to create forum',
      error: error.message
    });
  }
};


// View all forums with their products
const viewForums = async (req, res) => {
  try {
    const forums = await Forum.findAll({
      include: [
        {
          model: ForumProduct,
          as: 'forumProducts',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['pid', 'product_name', 'stocks']
          }]
        },
        {
          model: User,
          as: 'user',
          attributes: ['uid', 'username', 'role']  
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      message: 'Forums retrieved successfully',
      data: forums
    });
  } catch (error) {
    console.error('Error fetching forums:', error);
    return res.status(500).json({
      message: 'Failed to fetch forums',
      error: error.message
    });
  }
};

// Update forum
const updateForum = async (req, res) => {
  const transaction = await Forum.sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { name, phone_number, close_date, forumProducts } = req.body;

    // Validate forum exists
    const forum = await Forum.findByPk(id);
    if (!forum) {
      await transaction.rollback();
      return res.status(404).json({
        message: 'Forum not found'
      });
    }

    // Update main forum details
    await forum.update({
      name,
      phone_number,
      close_date
    }, { transaction });

    // Update forum products
    if (forumProducts && forumProducts.length > 0) {
      for (const product of forumProducts) {
        const forumProduct = await ForumProduct.findOne({
          where: {
            fpid: product.fpid,
            forum_id: id
          }
        });

        if (forumProduct) {
          await forumProduct.update({
            product_name: product.product_name,
            quantity: product.quantity
          }, { transaction });
        }
      }
    }

    await transaction.commit();

    return res.status(200).json({
      message: 'Forum updated successfully'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating forum:', error);
    return res.status(500).json({
      message: 'Failed to update forum',
      error: error.message
    });
  }
};

// Take forum product
const takeForum = async (req, res) => {
  const transaction = await Forum.sequelize.transaction();
  
  try {
    const { fid } = req.params;
    const { distributor_id } = req.body;

    // Validate input
    if (!fid || !distributor_id) {
      throw new Error('Missing required parameters');
    }

    // First, find the forum with its products
    const forum = await Forum.findOne({
      where: { fid: fid }, // Explicitly use fid
      include: [{
        model: ForumProduct,
        as: 'forumProducts',
        include: [{
          model: Product,
          as: 'product'
        }]
      }],
      transaction
    });

    if (!forum) {
      throw new Error('Forum not found');
    }

    if (forum.status === 'Taken') {
      throw new Error('This forum is already taken');
    }

    // Check stocks for all products
    for (const forumProduct of forum.forumProducts) {
      if (!forumProduct.product || forumProduct.product.stocks < forumProduct.quantity) {
        throw new Error(`Insufficient stock for product: ${forumProduct.product_name}`);
      }
    }

    // Create forum take record
    const forumTake = await ForumTake.create({
      fid: fid, // Use fid instead of forum_id
      distributor_id: distributor_id,
      taken_at: new Date()
    }, { transaction });

    // Update product stocks and forum product status
    await Promise.all(forum.forumProducts.map(async (forumProduct) => {
    //   // Update product stock
    //   await Product.decrement('stocks', {
    //     by: forumProduct.quantity,
    //     where: { pid: forumProduct.product_id },
    //     transaction
    //   });

      // Update forum product status
      await forumProduct.update({ status: 'Taken' }, { transaction });
    }));

    // Update forum status
    await forum.update({ status: 'Taken' }, { transaction });

    await transaction.commit();

    return res.status(200).json({
      message: 'Forum taken successfully',
      data: forumTake
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error taking forum:', error);
    return res.status(400).json({
      message: 'Failed to take forum',
      error: error.message
    });
  }
};
// Delete forum
const deleteForum = async (req, res) => {
  const transaction = await Forum.sequelize.transaction();
  
  try {
    const { id } = req.params;

    const forum = await Forum.findOne({
      where: { fid: id },
      transaction
    });

    if (!forum) {
      await transaction.rollback();
      return res.status(404).json({
        message: 'Forum not found'
      });
    }

    await forum.destroy({ transaction });
    await transaction.commit();

    return res.status(200).json({
      message: 'Forum deleted successfully'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting forum:', error);
    return res.status(500).json({
      message: 'Failed to delete forum',
      error: error.message
    });
  }
};

// Show notifications for distributor
const showNotifyForDistributor = async (req, res) => {
  const userId = req.params.id;

  try {
    const forums = await ForumTake.findAll({
      where: {
        distributor_id: userId
      },
      include: [
        {
          model: Forum,
          as: 'forum',
          include: [{
            model: ForumProduct,
            as: 'products'
          }]
        }
      ],
      order: [['taken_at', 'DESC']]
    });

    if (forums.length === 0) {
      return res.status(200).json({
        message: 'No forum takes found for this user',
        data: []
      });
    }

    const formattedForums = await Promise.all(
      forums.map(async (forum) => {
        if (!forum || !forum.forum) {
          return null;
        }

        const userData = await User.findOne({
          where: {
            uid: forum.forum.user_id
          }
        });

        return {
          takeId: forum.ftid,
          forumId: forum.forum.fid,
          forumOwnerId: userData?.username || 'Unknown',
          forumOwnerPhone: userData?.mobile_number || 'No Mobile number',
          forumOwnerAddress: userData?.address || 'No Address',
          forumOwnerEmail: userData?.email || 'No Email',
          products: forum.forum.products,
          takenAt: forum.taken_at
        };
      })
    );

    const validForums = formattedForums.filter(forum => forum !== null);

    return res.status(200).json({
      message: 'Forums retrieved successfully',
      data: validForums
    });
  } catch (error) {
    console.error('Error retrieving forums:', error);
    return res.status(500).json({
      message: 'Failed to retrieve forums',
      error: error.message
    });
  }
};

// Show notifications for technician
const showNotifyForTechnician = async (req, res) => {
  const userId = req.params.id;

  try {
    const userForums = await Forum.findAll({
      where: {
        user_id: userId
      },
      include: [
        {
          model: ForumProduct,
          as: 'products'
        }
      ]
    });

    if (userForums.length === 0) {
      return res.status(200).json({
        message: 'No forums found for this user',
        data: []
      });
    }

    const forums = await ForumTake.findAll({
      where: {
        forum_id: userForums.map(forum => forum.fid)
      },
      include: [
        {
          model: User,
          as: 'distributor',
          attributes: ['uid', 'username', 'email', 'mobile_number', 'address']
        }
      ],
      order: [['taken_at', 'DESC']]
    });

    const formattedForums = forums.map(forum => ({
      takeId: forum.ftid,
      forumId: forum.forum_id,
      distributorName: forum.distributor?.username || 'Unknown',
      distributorEmail: forum.distributor?.email || 'No Email',
      distributorPhone: forum.distributor?.mobile_number || 'No Phone',
      distributorAddress: forum.distributor?.address || 'No Address',
      products: userForums.find(f => f.fid === forum.forum_id)?.products || [],
      takenAt: forum.taken_at
    }));

    return res.status(200).json({
      message: 'Forums retrieved successfully',
      data: formattedForums
    });
  } catch (error) {
    console.error('Error retrieving forums:', error);
    return res.status(500).json({
      message: 'Failed to retrieve forums',
      error: error.message
    });
  }
};

// Get forum takes by item ID
const getForumTakesByIdemId = async (req, res) => {
  try {
    const itemId = req.params.id;

    const forumTakes = await ForumTake.findAll({
      where: { fid: itemId },
      include: [
        {
          model: Forum,
          as: 'forum',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['uid', 'username', 'email', 'mobile_number', 'address']
            },
            {
              model: ForumProduct,
              as: 'forumProducts'
            }
          ]
        },
        {
          model: User,
          as: 'distributor',
          attributes: ['uid', 'username', 'email', 'mobile_number', 'address']
        }
      ]
    });

    const formattedForumTakes = forumTakes.map(forumTake => ({
      takeId: forumTake.ftid,
      forumId: forumTake.forum.fid,
      forumOwnerId: forumTake.forum.user.uid,
      forumOwnerName: forumTake.forum.user.username,
      forumOwnerPhone: forumTake.forum.user.mobile_number,
      forumOwnerEmail: forumTake.forum.user.email,
      distributorName: forumTake.distributor.username,
      distributorEmail: forumTake.distributor.email,
      distributorPhone: forumTake.distributor.mobile_number,
      distributorAddress: forumTake.distributor.address,
      products: forumTake.forum.products,
      takenAt: forumTake.taken_at
    }));

    return res.status(200).json({
      message: 'Forum takes retrieved successfully',
      data: formattedForumTakes
    });
  } catch (error) {
    console.error('Error retrieving forum takes:', error);
    return res.status(500).json({
      message: 'Failed to retrieve forum takes',
      error: error.message
    });
  }
};

// Cleanup expired forums
cron.schedule('0 0 * * *', async () => {
  console.log('Checking for expired forums...');
  const transaction = await Forum.sequelize.transaction();
  
  try {
    const now = new Date();
    const result = await Forum.destroy({
      where: {
        close_date: {
          [Sequelize.Op.lt]: now
        }
      },
      transaction
    });
    
    await transaction.commit();
    console.log(`${result} expired forums deleted.`);
  } catch (error) {
    await transaction.rollback();
    console.error('Error during forum cleanup:', error);
  }
});

module.exports = {
  addForum,
  viewForums,
  updateForum,
  deleteForum,
  takeForum,
  showNotifyForDistributor,
  showNotifyForTechnician,
  getForumTakesByIdemId
};