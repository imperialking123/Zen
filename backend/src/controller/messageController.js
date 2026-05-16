import Message from "../model/messageModel.js";
import Conversation from "../model/conversationModel.js";
import User from "../model/userModel.js";
import imageKitInstance from "../lib/kitUploader.js";
import { emitPayloadToOtherSessions, emitPayLoadToUser } from "../lib/io.js";

export const handleSendMessage = async (req, res) => {
  try {
    const user = req.user;
    const attachments = req.uploadedAttachments;
    const conversation = req.conversation;
    const isNewConversation = Boolean(req.isNewConversation)
    const session = req.session

    if (!conversation) {
      return res.status(400).json({ message: "NO_CONVERSATION_TARGET" });
    }

    const otherUserId = conversation.participants.find(
      (p) => p.toString() !== user._id.toString(),
    );

    const { type, text, receiverId, replyTo } = req.body || {};

    if (!type || !["default", "gif"].includes(type)) {
      return res.status(400).json({ message: "INVALID_MESSAGE_TYPE" });
    }


    const messageObj = {
      senderId: user._id,
      receiverId: otherUserId || receiverId,
      conversationId: conversation._id,
      type: type,
    };

    if (type === "default") {
      const hasText =
        text && typeof text === "string" && text.trim().length > 0;
      const hasAttachments =
        attachments && Array.isArray(attachments) && attachments.length > 0;

      if (!hasText && !hasAttachments) {
        return res
          .status(400)
          .json({ message: "DEFAULT_MESSAGE_REQUIRES_TEXT_OR_ATTACHMENTS" });
      }

      if (hasAttachments) {
        messageObj["attachments"] = attachments;
      }

      if (hasText) {
        messageObj["text"] = text;
      }
    }

    if (type === "gif") {
      const { id, preview, full } = req?.body?.gif || {};

      if (!id || !preview || !full) {
        return res.status(400).json({ message: "INVALID_GIF_DATA" });
      }

      messageObj.gif = req.body.gif;
    }

    let repliedMessageVar;
    if (replyTo && typeof replyTo === "string") {
      const getRepliedMessage = await Message.findById(replyTo);
      repliedMessageVar = getRepliedMessage.toObject();
      messageObj.replyTo = replyTo;
      messageObj.isReplied = true;
    }

    const newMessage = await Message.create({ ...messageObj });

    const messageReturnObject = {
      ...newMessage.toObject(),
    };

    if (repliedMessageVar) {
      messageReturnObject.replyTo = repliedMessageVar;
    }

    const returnObject = {
      message: messageReturnObject,
    }

    const receiverPayload = {
      type: "RECEIVE_MESSAGE",
      message: messageReturnObject,
    }

    const otherDevicesPayload = {
      message: messageReturnObject,
      type: "RECEIVE_MESSAGE"
    }

    if (isNewConversation) {
      const senderUser = user;
      const receiverUser = await User.findById(otherUserId);

      const conversationForReceiver = {
        ...conversation.toObject(),
        otherUser: senderUser,
      };

      const conversationForSender = {
        ...conversation.toObject(),
        otherUser: receiverUser.toObject(),
      };

      receiverPayload["newConversation"] = conversationForReceiver;
      returnObject["newConversation"] = conversationForSender;
      otherDevicesPayload["newConversation"] = conversationForSender;
    }

    emitPayLoadToUser(otherUserId, "EVENT:ADD", receiverPayload)
    emitPayloadToOtherSessions(user._id, "EVENT:ADD", otherDevicesPayload, session._id)






    return res.status(201).json(returnObject);
  } catch (error) {
    console.log(
      "Error on #handleSendMessage #messageController.js Error --->",
      error,
    );

    return res.status(500).json({ message: "SERVER_ERROR" });
  }
};

export const handleGetAllMessages = async (req, res) => {
  try {
    const { conversationId } = req.params || {};

    if (!conversationId || typeof conversationId !== "string") {
      return res.status(400).json({ message: "INVALID_OR_NO_PARAMS" });
    }

    // //Alert Add Switch when space is defined
    // const conversation = await Conversation.findOne({
    //   _id: conversationId,
    // }).populate("connectionId");

    // if (!conversation || !conversation.connectionId) {
    //   return res.status(400).json({ message: "UNAUTHORIZED_FETCH" });
    // }
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .limit(100)
      .populate("replyTo")
      .populate("reactions.$*", "username");

    return res.status(200).json(messages);
  } catch (error) {
    console.log(
      "Error on #handleGetAllMessage  #messageCotroller.js error -->",
      error,
    );
    return res.status(500).json({ message: "SERVER_ERROR" });
  }
};

export const handleForwardMessage = async (req, res) => {
  try {
    const { conversationIds, messageContent } = req.body || {};

    console.log(messageContent);

    const user = req.user;

    const { type, text, attachments, gif } = messageContent || {};

    if (!type || !["default", "gif"].includes(type)) {
      return res.status(400).json({ message: "INVALID_MESSAGE_TYPE" });
    }

    if (type === "default") {
      const hasText =
        text && typeof text === "string" && text.trim().length > 0;
      const hasAttachments =
        attachments && Array.isArray(attachments) && attachments.length > 0;

      if (!hasText && !hasAttachments) {
        return res
          .status(400)
          .json({ message: "DEFAULT_MESSAGE_REQUIRES_TEXT_OR_ATTACHMENTS" });
      }

      if (hasAttachments) {
        for (const attachment of attachments) {
          if (!attachment.filePath || typeof attachment.filePath !== "string") {
            return res
              .status(400)
              .json({ message: "INVALID_ATTACHMENT_FILEPATH" });
          }
          if (!attachment.name || typeof attachment.name !== "string") {
            return res.status(400).json({ message: "INVALID_ATTACHMENT_NAME" });
          }
          if (
            !attachment.size ||
            typeof attachment.size !== "number" ||
            attachment.size <= 0
          ) {
            return res.status(400).json({ message: "INVALID_ATTACHMENT_SIZE" });
          }
          if (!attachment.fileId || typeof attachment.fileId !== "string") {
            return res
              .status(400)
              .json({ message: "INVALID_ATTACHMENT_FILEID" });
          }
        }
      }
    }

    if (type === "gif") {
      if (!gif || typeof gif !== "object") {
        return res
          .status(400)
          .json({ message: "GIF_MESSAGE_REQUIRES_GIF_DATA" });
      }

      if (!gif.full || typeof gif.full !== "string") {
        return res.status(400).json({ message: "INVALID_GIF_FULL" });
      }
      if (!gif.preview || typeof gif.preview !== "string") {
        return res.status(400).json({ message: "INVALID_GIF_PREVIEW" });
      }
    }

    if (
      !conversationIds ||
      !Array.isArray(conversationIds) ||
      conversationIds.length < 1
    ) {
      return res.status(400).json({ message: "NO_DESTINATION" });
    }

    const conversations = await Conversation.find({
      _id: { $in: conversationIds },
    });

    if (
      !conversations ||
      !Array.isArray(conversations) ||
      conversations.length < 1
    ) {
      return res.status(400).json({ message: "NO_DESTINATION" });
    }

    const baseMessageObj = {
      isForwarded: true,
    };

    if (text) {
      baseMessageObj.text = text;
    }

    if (attachments) {
      baseMessageObj["attachments"] = attachments;
    }

    if (gif) {
      baseMessageObj["gif"] = gif;
    }

    const messageData = conversations.map((convo) => {
      const receiverId = convo.participants.find(
        (p) => p.toString() !== user._id.toString(),
      );

      return {
        ...baseMessageObj,
        senderId: user._id,
        receiverId,
        type,
        conversationId: convo._id,
      };
    });

    // Create all messages in one DB call
    const newMessages = await Message.insertMany(messageData);

    const returnData = newMessages.map((msg) => ({
      conversationId: msg.conversationId,
    }));

    return res.status(200).json({ message: "success", data: returnData });
  } catch (error) {
    console.log(
      "Error on handleForwardMessage error ---> ",
      error?.message || error,
    );

    return res.status(500).json({ message: "SERVER_ERROR" });
  }
};

export const handleDeleteMessage = async (req, res) => {
  try {
    const user = req.user;
    const session = req.session;

    const { convoId, messageId } = req?.query || {};

    if (!convoId || !messageId)
      return res.status(400).json({ message: "NO_TARGET" });

    if (typeof convoId !== "string" || typeof messageId !== "string") {
      return res.status(400).json({ message: "INVALID_PAYLOAD" });
    }

    const findConvo = await Conversation.findOne({ _id: convoId });

    if (!findConvo) return res.status(400).json({ message: "NO_DESTINATION" });

    const findUserInConvo = findConvo.participants.find((p) =>
      p.equals(user._id),
    );

    const otherUserId = findConvo.participants.find((p) => !p.equals(user._id));

    if (!findUserInConvo) {
      return res.status(400).json({ message: "NO_OWNERSHIP" });
    }

    const findMessage = await Message.findOne({ _id: messageId });

    if (!findMessage) {
      return res.status(400).json({ message: "NO_TARGET" });
    }

    if (findMessage.attachments && findMessage.attachments.length > 0) {
      const messagesWithSameAttachments = await Message.find({
        _id: { $ne: messageId }, // Exclude the message we're deleting
        $or: [
          {
            "attachments.fileId": {
              $in: findMessage.attachments.map((a) => a.fileId),
            },
          },
          {
            "attachments.filePath": {
              $in: findMessage.attachments.map((a) => a.filePath),
            },
          },
        ],
      });

      // Check if attachments are used elsewhere
      const hasSharedAttachments = messagesWithSameAttachments.length > 0;

      if (!hasSharedAttachments) {
        const fileIds = [];
        findMessage.attachments.forEach((t) => {
          fileIds.push(t.fileId);
        });

        try {
          const deleteRes = await imageKitInstance.bulkDeleteFiles(fileIds);
          console.log({
            message: "Bulk Deleted files",
            ids: fileIds,
            successfullyDeletedFileIds: deleteRes.successfullyDeletedFileIds,
          });
        } catch (error) {
          console.log(
            "Failed to Delete Files Error --> ",
            error.message || error,
          );
        }
      }
    }

    await findMessage.deleteOne();

    if (otherUserId) {
      emitPayLoadToUser(otherUserId, "EVENT:REMOVE", {
        type: "DELETE_MESSAGE",
        conversationId: findConvo._id,
        messageId: findMessage._id,
      });
    }

    emitPayloadToOtherSessions(
      user._id,
      "SYNC:REMOVE",
      {
        type: "DELETE_MESSAGE",
        conversationId: findConvo._id,
        messageId: findMessage._id,
      },
      session._id,
    );

    return res.status(204).end();
  } catch (error) {
    console.log(
      "Error on handleDeleteMessage Errror message -->",
      error?.message || error,
    );
  }
};

export const handleReactToMesssage = async (req, res) => {
  try {
    const user = req.user;
    const session = req.session;
    const { messageId, conversationId, emoji } = req.body;

    if (!messageId)
      return res.status(400).json({ message: "MESSAGE_ID_REQUIRED" });

    if (!conversationId)
      return res.status(400).json({ message: "CONVERSATION_ID_REQUIRED" });

    if (!emoji) return res.status(400).json({ message: "EMOJI_REQUIRED" });

    if (typeof messageId !== "string")
      return res
        .status(400)
        .json({ message: "MESSAGE_ID_INVALID_REQUIRED_STRING" });

    if (typeof conversationId !== "string")
      return res
        .status(400)
        .json({ message: "CONVERSATION_ID_INVALID_REQUIRED_STRING" });

    if (typeof emoji !== "string")
      return res.status(400).json({ message: "EMOJI_INVALID_REQUIRED_STRING" });

    const findConversation = await Conversation.findById(conversationId);

    if (!findConversation)
      return res.status(400).json({ message: "NO_CONVERSATION_TARGET" });

    const isUserIncluded = findConversation.participants.find((p) =>
      p.equals(user._id),
    );

    if (!isUserIncluded)
      return res.status(400).json({ message: "NOT_A_PARTICIPANT" });

    const otherUserId = findConversation.participants.find(
      (p) => !p.equals(user._id),
    );

    const findMessage = await Message.findById(messageId);

    if (!findMessage)
      return res.status(404).json({ message: "MESSAGE_NOT_FOUND" });

    // consistently use findMessage
    const emojiReactions = findMessage.reactions?.get(emoji) || [];
    const userAlreadyReacted = emojiReactions.some(
      (id) => id.toString() === user._id.toString(),
    );

    if (userAlreadyReacted) {
      await findMessage.updateOne({
        $pull: { [`reactions.${emoji}`]: user._id },
      });

      //  after pulling, reload and delete the key if array is now empty
      const updated = await Message.findById(messageId);
      const updatedReactions = updated.reactions?.get(emoji) || [];
      if (updatedReactions.length === 0) {
        await updated.updateOne({
          $unset: { [`reactions.${emoji}`]: "" },
        });
      }
    } else {
      await findMessage.updateOne({
        $addToSet: { [`reactions.${emoji}`]: user._id },
      });
    }

    if (otherUserId) {
      emitPayLoadToUser(otherUserId, "EVENT:UPDATE", {
        messageId: findMessage._id,
        conversationId: findConversation._id,
        emoji,
        reactedBy: user._id,
        reactedByUsername: user.username,
        type: "react",
      });
    }

    emitPayloadToOtherSessions(
      user._id,
      "SYNC:UPDATE",
      {
        messageId: findMessage._id,
        conversationId: findConversation._id,
        emoji,
        reactedBy: user._id,
        reactedByUsername: user.username,
        type: "react",
      },
      session._id,
    );

    return res.status(204).end();
  } catch (error) {
    console.log("Error on #handleReactToMesssage Error  ---> ", error.message);
    return res.status(500).json({ message: "SERVER_ERROR" });
  }
};

export const handleEditMessage = async (req, res) => {
  try {
    const { messageId, conversationId, modifiedText } = req.body;

    if (!messageId) {
      return res.status(400).json({ message: "MESSAGE_ID_REQUIRED" });
    }

    if (!conversationId) {
      return res.status(400).json({ message: "CONVERSATION_ID_REQUIRED" });
    }

    if (!modifiedText) {
      return res.status(400).json({ message: "MODIFIED_TEXT_REQUIRED" });
    }

    if (typeof messageId !== "string") {
      return res
        .status(400)
        .json({ message: "MESSAGE_ID_INVALID_REQUIRED_STRING" });
    }

    if (typeof conversationId !== "string") {
      return res
        .status(400)
        .json({ message: "CONVERSATION_ID_INVALID_REQUIRED_STRING" });
    }

    if (typeof modifiedText !== "string") {
      return res
        .status(400)
        .json({ message: "MODIFIED_TEXT_INVALID_REQUIRED_STRING" });
    }

    if (modifiedText.trim() === "") {
      return res
        .status(400)
        .json({ message: "EMPTY_TEXT_NOT_ALLOWED_DELETE_INSTEAD" });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "MESSAGE_NOT_FOUND" });
    }

    if (!message.senderId.equals(req.user._id)) {
      return res.status(403).json({ message: "NOT_MESSAGE_OWNER" });
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { text: modifiedText },
      { returnDocument: "after" },
    );
    return res.status(200).json(updatedMessage);
  } catch (error) {
    console.log(
      "Error on #handleEditMessage #messageController.js Error --->",
      error?.message || error,
    );

    return res.status(500).json({ message: "SERVER_ERROR" });
  }
};

export const handleRemoveAttachment = async (req, res) => {
  try {
    const { msgIndex, fileId, convoId } = req.body || {};

    if (msgIndex === undefined || !fileId || !convoId) {
      return res.status(400).json({ message: "MISSING_REQUIRED_PARAMETERS" });
    }

    // Validate required fields
    if (
      typeof msgIndex !== "number" ||
      typeof fileId !== "string" ||
      typeof convoId !== "string"
    ) {
      return res.status(400).json({ message: "INVALID_PARAMETERS" });
    }

    const findConversation = await Conversation.findById(convoId);

    if (!findConversation) {
      return res.status(400).json({ message: "NO_CONVERSATION_TARGET" });
    }

    const isUserIncluded = findConversation.participants.find((p) =>
      p.equals(req.user._id),
    );

    if (!isUserIncluded) {
      return res.status(400).json({ message: "NOT_A_PARTICIPANT" });
    }

    // Get all messages in conversation
    const conversationMessages = await Message.find({
      conversationId: convoId,
    });

    // Find the target message by index
    const targetMessage = conversationMessages[msgIndex];

    if (!targetMessage) {
      return res.status(404).json({ message: "MESSAGE_NOT_FOUND" });
    }

    // Check if the attachment exists in the message
    const attachmentToRemove = targetMessage.attachments.find(
      (att) => att.fileId === fileId,
    );
    if (!attachmentToRemove) {
      return res.status(404).json({ message: "ATTACHMENT_NOT_FOUND" });
    }

    // Check if this attachment is used in other messages
    const messagesWithSameAttachment = await Message.find({
      _id: { $ne: targetMessage._id }, // Exclude target message
      $or: [
        {
          "attachments.fileId": { $in: [fileId] },
        },
        {
          "attachments.filePath": { $in: [attachmentToRemove.filePath] },
        },
      ],
    });

    const hasSharedAttachment = messagesWithSameAttachment.length > 0;

    // Remove the attachment from the message
    const updatedMessage = await Message.findByIdAndUpdate(
      targetMessage._id,
      {
        $pull: { attachments: { fileId: fileId } },
        updatedAt: new Date().toISOString(),
      },
      { returnDocument: "after" },
    );

    // Delete from ImageKit if not shared elsewhere
    if (!hasSharedAttachment) {
      try {
        const deleteRes = await imageKitInstance.bulkDeleteFiles([fileId]);
        console.log({
          message: "Deleted attachment file",
          fileId: fileId,
          successfullyDeletedFileIds: deleteRes.successfullyDeletedFileIds,
        });
      } catch (error) {
        console.log(
          "Failed to Delete Attachment File Error --> ",
          error.message || error,
        );
      }
    }

    // Get other participant for socket emission
    const otherUserId = findConversation.participants.find(
      (p) => !p.equals(req.user._id),
    );

    // Emit to other user
    if (otherUserId) {
      emitPayLoadToUser(otherUserId, "EVENT:UPDATE", {
        type: "REMOVE_ATTACHMENT",
        conversationId: convoId,
        messageId: targetMessage._id,
        fileId: fileId,
        updatedBy: req.user._id,
        updatedByUsername: req.user.username,
      });
    }

    // Emit to other sessions
    emitPayloadToOtherSessions(
      req.user._id,
      "SYNC:UPDATE",
      {
        type: "REMOVE_ATTACHMENT",
        conversationId: convoId,
        messageId: targetMessage._id,
        fileId: fileId,
        updatedBy: req.user._id,
        updatedByUsername: req.user.username,
      },
      req.session._id,
    );

    return res.status(200).json(updatedMessage);
  } catch (error) {
    console.log("Error removing attachment:", error);
    return res.status(500).json({ message: "SERVER_ERROR" });
  }
};
