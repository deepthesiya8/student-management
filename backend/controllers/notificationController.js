import Notification from '../models/Notification.js';

// 1. Create notification
export const createNotification = async (req, res, next) => {
  try {
    const { title, message, targetRole } = req.body;
    const notification = await Notification.create({
      title,
      message,
      targetRole: targetRole || 'All',
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, message: 'Notification created', notification });
  } catch (error) {
    next(error);
  }
};

// 2. Get notifications
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find().sort({ date: -1 });
    res.json({ success: true, count: notifications.length, notifications });
  } catch (error) {
    next(error);
  }
};

// 3. Mark notification as read
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { isReadBy: req.user._id } },
      { new: true }
    );
    res.json({ success: true, message: 'Marked as read', notification });
  } catch (error) {
    next(error);
  }
};

// 4. Delete notification (Admin)
export const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    next(error);
  }
};
