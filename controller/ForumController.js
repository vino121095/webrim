const { where, Sequelize } = require('sequelize');
const Forum = require('../model/ForumModel'); 
const ForumTake = require('../model/ForumTakesmodel');
const User = require('../model/UserModel');
const Product = require('../model/Productmodel');
const cron = require('node-cron');

// Add a new forum
const addForum = async (req, res) => {
  try {
    const forum = await Forum.create(req.body);
    return res.status(201).json({ message: 'Forum created successfully', data: forum });
  } catch (error) {
    console.error('Error creating forum:', error);
    return res.status(500).json({ message: 'Failed to create forum', error: error.message });
  }
};

cron.schedule('0 0 * * *', async () => {
  console.log('Checking for expired forums...');
  try {
      const now = new Date();
      // Delete forums with expired close_date
      const result = await Forum.destroy({
          where: {
              close_date: {
                  [Sequelize.Op.lt]: now // Expired close_date
              }
          }
      });
      console.log(`${result} expired forums deleted.`);
  } catch (error) {
      console.error('Error during forum cleanup:', error);
  }
});

// View all forums
const viewForums = async (req, res) => {
  try {
    const forums = await Forum.findAll();
    // {
    //   where: {
    //     status: 'Not Taken'
    //   }
    // }

    return res.status(200).json({ message: 'Forums retrieved successfully', data: forums });
  } catch (error) {
    console.error('Error fetching forums:', error);
    return res.status(500).json({ message: 'Failed to fetch forums', error: error.message });
  }
};

// Edit/Update Forum
const updateForum = async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = req.body;
    // Find the forum by ID and update it
    const forum = await Forum.findOne(
      {
        where: {fid:id}
      }
    );
    
    // Check if forum exists
    if (!forum) {
      return res.status(404).json({ 
        message: 'Forum not found' 
      });
    }
    await Forum.update(updateData,{
      where: {
        fid: id
      }
    })
    
    return res.status(200).json({ 
      message: 'Forum updated successfully', 
      data: forum 
    });
  } catch (error) {
    console.error('Error updating forum:', error);
    return res.status(500).json({ 
      message: 'Failed to update forum', 
      error: error.message 
    });
  }
};

// Delete Forum
const deleteForum = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Find and delete the forum
    const forum = await Forum.findOne({
      where:{fid:id}
    });
    
    // Check if forum exists
    if (!forum) {
      return res.status(404).json({ 
        message: 'Forum not found' 
      });
    }

    await forum.destroy();
    
    return res.status(200).json({ 
      message: 'Forum deleted successfully', 
      data: forum 
    });
  } catch (error) {
    console.error('Error deleting forum:', error);
    return res.status(500).json({ 
      message: 'Failed to delete forum', 
      error: error.message 
    });
  }
};

const takeForum = async (req, res) => {
  const forumId = req.params.id;
  const { distributor_id } = req.body;

  if (!forumId || !distributor_id) {
    return res.status(400).json({
      message: 'Forum ID and Distributor ID are required',
    });
  }

  const transaction = await Forum.sequelize.transaction();

  try {
    // First, find the forum to ensure it exists and get its product details
    const forum = await Forum.findByPk(forumId, {
      include: [{ model: Product, as: 'product' }],
      transaction
    });

    if (!forum) {
      await transaction.rollback();
      return res.status(404).json({
        message: 'Forum not found',
      });
    }

    // Check if the forum is already taken
    if (forum.status === 'Taken') {
      await transaction.rollback();
      return res.status(400).json({
        message: 'Forum is already taken',
      });
    }

    // Check if there's sufficient product stock
    if (forum.product.stocks < forum.quantity) {
      await transaction.rollback();
      return res.status(400).json({
        message: 'Insufficient product stock',
      });
    }

    // Reduce product stock
    await Product.decrement('stocks', {
      by: forum.quantity,
      where: { pid: forum.product_id },
      transaction
    });

    // Create forum take record
    const forumTake = await ForumTake.create({
      forum_id: forumId,
      distributor_id,
    }, { transaction });

    // Update forum status
    await Forum.update(
      { status: 'Taken' },
      { 
        where: { fid: forumId },
        transaction
      }
    );

    // Commit the transaction
    await transaction.commit();

    return res.status(201).json({
      message: 'Forum taken successfully',
      data: {
        forumTake,
        updatedProductStock: forum.product.stocks - forum.quantity
      }
    });
  }catch (error) {
    if (transaction) await transaction.rollback();
    console.error('Error taking forum:', error);
    return res.status(500).json({
      message: 'Failed to take forum',
      error: error.message,
    });
  }
};


const showNotifyForDistributor = async (req, res) => {
  const userId = req.params.id;

  try {
    // Verify user exists first (commented out based on your current code)
    // const userExists = await User.findByPk(userId);
    // if (!userExists) {
    //   return res.status(404).json({
    //     message: 'User not found',
    //     data: null
    //   });
    // }

    const forums = await ForumTake.findAll({
      where: {
        distributor_id: userId
      },
      include: [
        {
          model: Forum,
          as: 'forum',
        }
      ],
      order: [['taken_at', 'DESC']] // Sort by most recent first
    });

    // Check if any forum takes exist
    if (forums.length === 0) {
      return res.status(200).json({
        message: 'No forum takes found for this user',
        data: []
      });
    }

    // Transform the results to a more readable format with comprehensive null checks
    const formattedForums = await Promise.all(
      forums.map(async (forum) => {
        if (!forum || !forum.forum) {
          console.warn('Incomplete forum take data:', forum);
          return null;
        }

        const forumData = await Forum.findOne({
          where: {
            fid: forum.forum_id
          }
        });

        // Ensure forumData exists before proceeding
        if (!forumData) {
          console.warn('Forum data not found for forum_id:', forum.forum_id);
          return null;
        }

        const userData = await User.findOne({
          where: {
            uid: forumData.user_id
          }
        });

        return {
          takeId: forum.ftid,
          forumId: forumData.fid,
          forumOwnerId: forumData?.name|| userData.username,
          forumOwnerPhone: userData?.mobile_number || 'No Mobile number',
          forumOwnerAddress: userData?.address || 'No Address',
          forumOwnerEmail: userData.email,
          takenAt: forum.taken_at
        };
      })
    );

    // Filter out null entries
    const validForums = formattedForums.filter(forum => forum !== null);

    return res.status(200).json({
      message: 'Forums retrieved successfully',
      data: validForums
    });
  } catch (error) {
    console.error('Detailed error retrieving forums:', {
      message: error.message,
      stack: error.stack,
      userId: userId
    });

    return res.status(500).json({
      message: 'Failed to retrieve forums',
      error: {
        message: error.message,
        name: error.name
      }
    });
  }
};

const showNotifyForTechnician = async (req, res) => {
  const userId = req.params.id;

  try {
    // Find user forums
    const userForums = await Forum.findAll({
      where: {
        user_id: userId
      },
      include: [
        {
          model: User,
          as: 'user',
        }
      ]
    });

    // If no forums found for the user
    if (userForums.length === 0) {
      return res.status(200).json({
        message: 'No forums found for this user',
        data: []
      });
    }

    // Find forum takes
    const forums = await ForumTake.findAll({
      where: {
        forum_id: userForums.map(forum => forum.fid)
      },
      include: [
        {
          model: User, 
          as: 'distributor', 
          attributes: ['uid', 'username', 'email', 'mobile_number', 'address'] 
        },
      ],
      order: [['taken_at', 'DESC']]
    });

    // Check if any forum takes exist
    if (forums.length === 0) {
      return res.status(200).json({
        message: 'No forum takes found for this user',
        data: []
      });
    }

    // Transform the results to a more readable format
    const formattedForums = forums.map(forum => {
      // Safely extract forum and user data
      const forumData = forum.forum || {};
      const userData = forumData.user || {};

      return {
        takeId: forum.ftid,
        forumId: forumData.fid,
        // forumOwnerId: userData.uid,
        // forumOwnerName: userData.full_name || userData.username || 'Unknown',
        // forumOwnerPhone: userData.mobile_number || 'No Mobile number',
        // forumOwnerEmail: userData.email || 'No Email',
        distributorName: forum.distributor?.username || 'No Distributor',
        distributorEmail: forum.distributor?.email || 'No Email',
        distributorPhone: forum.distributor?.mobile_number || 'No Phone',
        distributorAddress: forum.distributor?.address || 'No Address',
        takenAt: forum.taken_at
      };
    });

    return res.status(200).json({
      message: 'Forums retrieved successfully',
      data: formattedForums
    });
  } catch (error) {
    console.error('Detailed error retrieving forums:', {
      message: error.message,
      stack: error.stack,
      userId: userId
    });

    return res.status(500).json({
      message: 'Failed to retrieve forums',
      error: {
        message: error.message,
        name: error.name
      }
    });
  }
};
const getForumTakesByIdemId = async (req, res) => {
  try {
    const itemId = req.params.id;

    // Find all forum takes for the given item ID
    const forumTakes = await ForumTake.findAll({
      where: { forum_id: itemId },
      include: [
        {
          model: Forum,
          as: 'forum',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['uid', 'username', 'email', 'mobile_number', 'address']
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

    // Transform the results to a more readable format
    const formattedForumTakes = forumTakes.map(forumTake => {
      const forum = forumTake.forum;
      const distributor = forumTake.distributor;

      return {
        takeId: forumTake.ftid,
        forumId: forum.fid,
        forumOwnerId: forum.user.uid,
        forumOwnerName: forum.user.username,
        forumOwnerPhone: forum.user.mobile_number,
        forumOwnerEmail: forum.user.email,
        distributorName: distributor.username,
        distributorEmail: distributor.email,
        distributorPhone: distributor.mobile_number,
        distributorAddress: distributor.address,
        takenAt: forumTake.taken_at
      };
    });

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
