import Notification from "../models/Notification.js";

export const createNotification = async ({ receiver, sender, type, post = null, text = "" }, io) => {
  if (receiver.toString() === sender.toString()) return null;

  const notification = await Notification.create({
    receiver,
    sender,
    type,
    post,
    text
  });

  const populated = await notification.populate([
    { path: "sender", select: "name username avatar" },
    { path: "post", select: "image caption" }
  ]);

  io?.to(receiver.toString()).emit("notification:new", populated);
  return populated;
};
