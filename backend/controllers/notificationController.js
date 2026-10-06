import Notification from '../models/Notification.js';

// 1. Create notification (Admin & Teacher)
export const createNotification = async (req, res, next) => {
  try {
    const { title, message, targetRole } = req.body;
    const notification = await Notification.create({
      title,
      message,
      targetRole: targetRole || (req.user.role === 'Teacher' ? 'Student' : 'All'),
      createdBy: req.user._id,
    });

    const populatedNotification = await Notification.findById(notification._id).populate(
      'createdBy',
      'name role email'
    );

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      notification: populatedNotification,
    });
  } catch (error) {
    next(error);
  }
};

// 2. Get notifications (with author details)
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find()
      .populate('createdBy', 'name role email')
      .sort({ date: -1 });
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

// 4. Delete notification (Admin or Author Teacher)
export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    // Admin can delete all; Teacher can only delete their own
    if (
      req.user.role !== 'Admin' &&
      notification.createdBy?.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ success: false, message: 'Not authorized to delete this announcement.' });
    }

    await notification.deleteOne();
    res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    next(error);
  }
};
