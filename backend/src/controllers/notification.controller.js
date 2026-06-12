const Notification = require('../models/Notification');

/**
 * Get all notifications for the authenticated user
 */
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30);

    return res.status(200).json(notifications);
  } catch (error) {
    console.error('Fetch Notifications Error:', error);
    return res.status(500).json({ message: 'Error retrieving notifications', error: error.message });
  }
};

/**
 * Mark a single notification as read
 */
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Ensure recipient matches req.user
    if (notification.recipientId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this resource' });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Mark Notification Read Error:', error);
    return res.status(500).json({ message: 'Error updating notification status', error: error.message });
  }
};
