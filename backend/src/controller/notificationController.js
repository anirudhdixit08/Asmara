import Notification, { NOTIFICATION_TYPES } from "../models/notificationModel.js";
import Comment from "../models/commentModel.js";
import Order from "../models/orderModel.js";

/**
 * Add a comment on an order and notify the partner.
 * Partner: if sender is Merchant (asmara), notify Factory; if sender is Factory, notify Merchant.
 */
export const addComment = async (req, res) => {
  try {
    const user = req.result;
    const { orderId, text } = req.body;

    if (!orderId || !text?.trim()) {
      return res.status(400).json({
        success: false,
        message: "orderId and text are required.",
      });
    }

    const order = await Order.findById(orderId).lean();
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    const merchantId = order.merchant?.toString();
    const factoryId = order.factory?.toString();
    const userId = user._id.toString();

    const isMerchant = userId === merchantId;
    const isFactory = userId === factoryId;

    if (!isMerchant && !isFactory) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this order.",
      });
    }

    const comment = await Comment.create({
      orderId,
      sender: user._id,
      text: text.trim(),
    });

    let partnerId = null;
    if (user.role === "asmara") {
      partnerId = order.factory;
    } else {
      partnerId = order.merchant;
    }

    if (partnerId) {
      await Notification.create({
        recipient: partnerId,
        sender: user._id,
        orderId,
        type: NOTIFICATION_TYPES[1],
        message: `New comment on order ${order.styleNumber || orderId}.`,
        isRead: false,
      });
    }

    const populated = await Comment.findById(comment._id)
      .populate("sender", "firstName lastName emailId organisationName")
      .lean();

    res.status(201).json({
      success: true,
      message: "Comment added and partner notified.",
      data: populated,
    });
  } catch (error) {
    console.error("Add Comment Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error." });
  }
};

/**
 * Get notifications for the logged-in user.
 * Factory: only notifications where recipient = userId.
 * Asmara: all notifications (merchants see all updates).
 */
export const getMyNotifications = async (req, res) => {
  try {
    const user = req.result;

    let query = {};
    if (user.role === "factory") {
      query.recipient = user._id;
    }
    // If Asmara, query remains {} so we return all notifications

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("sender", "firstName lastName emailId organisationName")
      .populate("orderId", "styleNumber buyerName")
      .lean();

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("Get Notifications Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error." });
  }
};

/**
 * Get full conversation (comments) for a specific order.
 * User must be the merchant or the assigned factory for that order.
 */
export const getComments = async (req, res) => {
  try {
    const { orderId } = req.params;
    const user = req.result;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "orderId is required." });
    }

    const order = await Order.findById(orderId).lean();
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    const merchantId = order.merchant?.toString();
    const factoryId = order.factory?.toString();
    const userId = user._id.toString();

    if (userId !== merchantId && userId !== factoryId) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this order.",
      });
    }

    const comments = await Comment.find({ orderId })
      .sort({ createdAt: 1 })
      .populate("sender", "firstName lastName emailId organisationName role")
      .lean();

    res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error("Get Comments Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error." });
  }
};
