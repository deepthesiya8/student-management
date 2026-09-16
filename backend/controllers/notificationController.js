import Notification from '../models/Notification.js';

// Create a new notification / announcement (Admin or Teacher)
export const createNotification = async (req, res, next) => {
  try {
    const { title, message, targetRole, recipientId } = req.body;

    const notification = await Notification.create({
      title,
      message,
      targetRole: targetRole || 'All',
      recipient: recipientId || null,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Notification published successfully',
      notification,
    });
  } catch (error) {
    next(error);
  }
};

// Get notifications applicable to logged-in user
export const getNotifications = async (req, res, next) => {
  try {
    const role = req.user.role;

    const query = {
      $or: [
        { targetRole: 'All' },
        { targetRole: role },
        { recipient: req.user._id },
      ],
    };

    const notifications = await Notification.find(query)
      .populate('createdBy', 'name role')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

// Mark notification as read
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (!notification.isReadBy.includes(req.user._id)) {
      notification.isReadBy.push(req.user._id);
      await notification.save();
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    next(error);
  }
};

// Delete notification (Admin)
export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
