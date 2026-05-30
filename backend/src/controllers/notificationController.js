import Notification from "../models/Notification.js";
import { sendResponse } from "../utils/apiResponse.js";

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ receiver: req.user._id })
      .sort({ createdAt: -1 })
      .populate("sender", "name username avatar")
      .populate("post", "image caption");

    sendResponse(res, 200, "Notifications loaded", notifications);
  } catch (error) {
    next(error);
  }
};

export const markNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ receiver: req.user._id, read: false }, { read: true });
    sendResponse(res, 200, "Notifications marked as read");
  } catch (error) {
    next(error);
  }
};
