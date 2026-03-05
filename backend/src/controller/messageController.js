import Message from "../model/messageModel.js";
import Conversation from "../model/conversationModel.js";
import imageKitInstance from "../lib/kitUploader.js";
import { emitPayloadToOtherSessions, emitPayLoadToUser } from "../lib/io.js";

export const handleSendMessage = async (req, res) => {
  try {
    const user = req.user;
    const attachments = req.uploadedAttachments;

    const { conversationId, type, text, receiverId } = req.body || {};

    if (!type || typeof type !== "string")
      return res.status(400).json({ message: "MESSAGE_TYPE_REQUIRED" });

    if (!conversationId || typeof conversationId !== "string")
      return res.status(400).json({ message: "NO_TARGET_CONVO_ID_REQUIRED" });

    const getConversation = await Conversation.findById(conversationId);

    if (!getConversation)
      return res.status(404).json({ message: "INVALID_CONVO_ID" });

    if (!getConversation.participants.some((p) => p.equals(user._id))) {
      return res.status(403).json({ message: "UNAUTHORIZED" });
    }

    const otherUserId = getConversation.participants.find(
      (p) => !p.equals(user._id),
    );

    const messageObj = {
      senderId: user._id,
      receiverId: otherUserId || receiverId,
      conversationId: getConversation._id,
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
        return res.status(400).json({ message: "Invalid gif data" });
      }

      messageObj.gif = req.body.gif;
    }

    const newMessage = await Message.create({ ...messageObj });

    return res.status(201).json(newMessage);
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
      if (!gifData || typeof gif !== "object") {
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
      baseMessageObj.attachments = attachments;
    }

    if (gif) {
      baseMessageObj.gif = gif;
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
      return res.status(400).json({ message: "MESSAGE_ID_INVALID_REQUIRED_STRING" });

    if (typeof conversationId !== "string")
      return res.status(400).json({ message: "CONVERSATION_ID_INVALID_REQUIRED_STRING" });

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

    // ✅ consistently use findMessage
    const emojiReactions = findMessage.reactions?.get(emoji) || [];
    const userAlreadyReacted = emojiReactions.some(
      (id) => id.toString() === user._id.toString(),
    );

    if (userAlreadyReacted) {
      await findMessage.updateOne({
        $pull: { [`reactions.${emoji}`]: user._id },
      });

      // ✅ after pulling, reload and delete the key if array is now empty
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
