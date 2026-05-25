import Conversation from "../model/conversationModel.js";

const verifyConvoConnected = async (req, res, next) => {
  try {
    const user = req.user;
    const { conversationId } = req.body;

    if (!user) {
      return res.status(401).json({ message: "USER_NOT_AUTHENTICATED" });
    }

    if (!conversationId) {
      return res.status(400).json({ message: "CONVERSATION_ID_REQUIRED" });
    }

    if (typeof conversationId !== "string") {
      return res.status(400).json({ message: "CONVERSATION_ID_INVALID_REQUIRED_STRING" });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "CONVERSATION_NOT_FOUND" });
    }

    const isUserParticipant = conversation.participants.some((participant) =>
      participant.equals(user._id)
    );

    if (!isUserParticipant) {
      return res.status(403).json({ message: "USER_NOT_PARTICIPANT_IN_CONVERSATION" });
    }

    req.conversation = conversation;
    next();

  } catch (error) {
    console.log(
      "Error on #verifyConvoConnected #middleware Error --->",
      error?.message || error,
    );
    return res.status(500).json({ message: "SERVER_ERROR" });
  }
};

export default verifyConvoConnected;