const { Notification } = require("../models");
const { ulid } = require("ulid");

async function createNotification(
  userPublicId,
  type,
  title,
  message,
  referenceType = null,
  referenceId = null
) {

  const notification = await Notification.create({

    notification_uid: ulid(),

    user_public_id: userPublicId,

    type,
    title,
    message,

    reference_type: referenceType,
    reference_id: referenceId

  });

  return notification;
}


async function getUserNotifications(userPublicId) {

  return Notification.findAll({
    where: { user_public_id: userPublicId },
    order: [["createdAt", "DESC"]]
  });

}


async function markNotificationRead(notificationId) {

  const notification = await Notification.findOne({
    where: { notification_uid: notificationId }
  });

  if (!notification) {
    throw new Error("Notification not found");
  }

  notification.is_read = true;
  await notification.save();

  return notification;

}


module.exports = {
  createNotification,
  getUserNotifications,
  markNotificationRead
};