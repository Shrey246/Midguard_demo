const notificationService = require("../services/notificationservice");

async function getNotifications(req, res) {

  try {

    const userId = req.user.publicId;

    const notifications = await notificationService.getUserNotifications(userId);

    res.status(200).json({
      success: true,
      notifications
    });

  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message
    });

  }

}


async function markAsRead(req, res) {

  try {

    const { notificationId } = req.body;

    const notification = await notificationService.markNotificationRead(notificationId);

    res.status(200).json({
      success: true,
      notification
    });

  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message
    });

  }

}

module.exports = {
  getNotifications,
  markAsRead
};