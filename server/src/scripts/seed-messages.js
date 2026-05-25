import mongoose from "mongoose";
import dotenv from "dotenv";
import Message from "../model/messageModel.js";
import ConnectDB from "../lib/db.js";

dotenv.config();

const conversationId = "6a086a84cf1a82f89eb46269";

const receipients = [
  new mongoose.Types.ObjectId("6a048e329e86b5889e27ec97"),
  new mongoose.Types.ObjectId("6a048e919e86b5889e27ecaa"),
];

const conversationTree = [
  { id: "msg1", sender: 0, delay: 60, text: "Hey, did you look at the new mockups for the Zen landing page?" },
  { id: "msg2", sender: 0, delay: 15, text: "I sent the Figma link in the general channel yesterday." },
  { id: "msg3", sender: 1, delay: 45, text: "Hey! Yes, I just opened them. They look super clean." },
  { id: "msg4", sender: 1, delay: 10, text: "Love the dark mode aesthetic in particular. The purple accent colors really pop." },
  { id: "msg5", sender: 0, delay: 50, text: "Awesome, credit goes to the design team. They worked all weekend on it.", replyTo: "msg3" },
  { id: "msg6", sender: 0, delay: 12, text: "Do you think the contrast ratio is high enough on the subheaders?", replyTo: "msg4" },
  { id: "msg7", sender: 1, delay: 40, text: "I think so. We should double-check using the WCAG checker tool just to be sure, though.", replyTo: "msg6" },
  { id: "msg8", sender: 1, delay: 15, text: "I can run that check real quick before our sync." },
  { id: "msg9", sender: 0, delay: 60, text: "That would be perfect. Let me know what the score is." },
  { id: "msg10", sender: 1, delay: 120, text: "Okay, just checked. The subheader contrast is 4.51:1, which passes AA compliance!" },
  { id: "msg11", sender: 1, delay: 8, text: "But the footer link contrast is only 3.2:1, so we need to darken that color a bit." },
  { id: "msg12", sender: 0, delay: 30, text: "Good catch. Let's make sure we update the footer link color in our CSS variables.", replyTo: "msg11" },
  { id: "msg13", sender: 0, delay: 10, text: "I'll make a ticket for it." },
  { id: "msg14", sender: 1, delay: 50, text: "Sounds good. By the way, how is the socket integration going?" },
  { id: "msg15", sender: 0, delay: 45, text: "Mostly done. I'm finishing up the typing indicator socket events.", replyTo: "msg14" },
  { id: "msg16", sender: 0, delay: 15, text: "I need to test it with multiple tabs open to see if the status resets properly." },
  { id: "msg17", sender: 1, delay: 30, text: "I can help you test that if you need another client.", replyTo: "msg16" },
  { id: "msg18", sender: 0, delay: 25, text: "That would be huge. Let's deploy the staging server first.", replyTo: "msg17" },
  { id: "msg19", sender: 0, delay: 10, text: "I'll push the current backend changes to main." },
  { id: "msg20", sender: 1, delay: 35, text: "Cool, tell me when it's built and ready.", replyTo: "msg19" },
  { id: "msg21", sender: 0, delay: 50, text: "Staging deployment is complete! The build finished in 45 seconds." },
  { id: "msg22", sender: 0, delay: 12, text: "Here's the link: https://staging.zen.chat" },
  { id: "msg23", sender: 1, delay: 40, text: "Awesome. I'm opening it now in two different browsers." },
  { id: "msg24", sender: 1, delay: 8, text: "Chrome and Firefox." },
  { id: "msg25", sender: 0, delay: 30, text: "Perfect. I'll login as User A, and you can login as User B." },
  { id: "msg26", sender: 1, delay: 50, text: "Got it. I'm logged in. I see you in the active contacts list.", replyTo: "msg25" },
  { id: "msg27", sender: 1, delay: 15, text: "Let me try typing a message to see if the indicator shows up." },
  { id: "msg28", sender: 0, delay: 20, text: "Wait, it works! I see 'Bob is typing...' at the bottom of the screen.", replyTo: "msg27" },
  { id: "msg29", sender: 0, delay: 10, text: "Let me stop typing for a second to verify the stopped event triggers." },
  { id: "msg30", sender: 1, delay: 35, text: "Yes, it disappeared immediately. That is incredibly responsive.", replyTo: "msg29" },
  { id: "msg31", sender: 1, delay: 15, text: "How does the message list container align when new messages drop in? Does it scroll down automatically?" },
  { id: "msg32", sender: 0, delay: 45, text: "If you are already scrolled to the bottom, it auto-scrolls. If you've scrolled up to read older messages, it stays pinned but shows a 'New Message' badge.", replyTo: "msg31" },
  { id: "msg33", sender: 0, delay: 12, text: "I'll send three quick messages to let you test the auto-scroll." },
  { id: "msg34", sender: 0, delay: 8, text: "Here's the first message." },
  { id: "msg35", sender: 0, delay: 5, text: "And the second one." },
  { id: "msg36", sender: 0, delay: 5, text: "And the third. Did it scroll down?" },
  { id: "msg37", sender: 1, delay: 30, text: "Yep! Auto-scrolled perfectly each time. No jumping or stuttering.", replyTo: "msg36" },
  { id: "msg38", sender: 1, delay: 12, text: "Wait, I did notice a small layout shift when the typing indicator disappears." },
  { id: "msg39", sender: 0, delay: 40, text: "Ah, is the indicator container height not fixed?", replyTo: "msg38" },
  { id: "msg40", sender: 1, delay: 25, text: "Exactly. It collapses to 0px, which pushes the list. We should keep its height constant.", replyTo: "msg39" },
  { id: "msg41", sender: 0, delay: 45, text: "Good point. I'll set a fixed height of `24px` on the typing indicator container." },
  { id: "msg42", sender: 0, delay: 10, text: "And give it a smooth fade-in / fade-out transition." },
  { id: "msg43", sender: 1, delay: 35, text: "That should fix it. Did you push the read receipts hook to staging yet?", replyTo: "msg41" },
  { id: "msg44", sender: 0, delay: 55, text: "Yes, it is deployed! Let's test the visibility observer.", replyTo: "msg43" },
  { id: "msg45", sender: 0, delay: 15, text: "Scroll up to the top of our chat so some old messages go off-screen." },
  { id: "msg46", sender: 0, delay: 8, text: "Then scroll back down slowly." },
  { id: "msg47", sender: 1, delay: 50, text: "Okay, scrolling up..." },
  { id: "msg48", sender: 1, delay: 8, text: "I see a few older messages are marked as read now." },
  { id: "msg49", sender: 1, delay: 25, text: "Yep, the checkmark icon in the corner updated from one check (delivered) to double checkmarks (read)!", replyTo: "msg47" },
  { id: "msg50", sender: 0, delay: 30, text: "Awesome! That means the Intersection Observer is tracking correctly and triggering the DB update via socket.", replyTo: "msg49" },
  { id: "msg51", sender: 1, delay: 40, text: "Is it emitting a database write on every single message read?", replyTo: "msg50" },
  { id: "msg52", sender: 0, delay: 45, text: "Right now, yes. I need to implement a batching queue on the client side.", replyTo: "msg51" },
  { id: "msg53", sender: 0, delay: 15, text: "Especially for active conversations where messages are read rapidly." },
  { id: "msg54", sender: 1, delay: 50, text: "Definitely. We don't want to spam the Mongo instance with dozens of updateOne queries.", replyTo: "msg52" },
  { id: "msg55", sender: 1, delay: 10, text: "We can queue the message IDs and flush them every 2 seconds.", replyTo: "msg54" },
  { id: "msg56", sender: 0, delay: 35, text: "Agreed. I'll write a helper utility `MessageReadQueue` tomorrow to handle the buffer.", replyTo: "msg55" },
  { id: "msg57", sender: 0, delay: 8, text: "It can throttle the socket emits." },
  { id: "msg58", sender: 1, delay: 45, text: "Perfect. By the way, what about image sharing? Are we supporting image uploads in this sprint?" },
  { id: "msg59", sender: 0, delay: 50, text: "Yes! That's our next major feature. I've been studying the Multer configuration.", replyTo: "msg58" },
  { id: "msg60", sender: 1, delay: 35, text: "Sweet. We'll need a solid file type validation in the middleware.", replyTo: "msg59" },
  { id: "msg61", sender: 0, delay: 40, text: "I already configured Multer to only allow images under 10MB." },
  { id: "msg62", sender: 0, delay: 12, text: "And I'm checking MIME types on the buffer itself so file extension spoofing won't work." },
  { id: "msg63", sender: 1, delay: 35, text: "Perfect. Security first. What CDN are we using for rendering?", replyTo: "msg61" },
  { id: "msg64", sender: 0, delay: 50, text: "ImageKit. It has built-in image optimization and transformations.", replyTo: "msg63" },
  { id: "msg65", sender: 0, delay: 15, text: "So we can fetch resized images for avatar thumbnails, which saves bandwidth." },
  { id: "msg66", sender: 1, delay: 45, text: "Oh, that's really useful. How are we displaying images while they load?", replyTo: "msg64" },
  { id: "msg67", sender: 0, delay: 60, text: "We generate a blurHash string on the backend during the upload phase.", replyTo: "msg66" },
  { id: "msg68", sender: 0, delay: 10, text: "Then send it with the message. The client draws the blurHash on a canvas placeholder immediately." },
  { id: "msg69", sender: 1, delay: 35, text: "Brilliant! No layout shifting. What about the upload state itself?", replyTo: "msg68" },
  { id: "msg70", sender: 0, delay: 50, text: "The UI shows a preview card with a circular progress overlay.", replyTo: "msg69" },
  { id: "msg71", sender: 0, delay: 12, text: "If the upload fails, the state changes to 'failed' and shows a retry button." },
  { id: "msg72", sender: 1, delay: 40, text: "Awesome. Let's make sure the retry actually works without having to re-select the file.", replyTo: "msg71" },
  { id: "msg73", sender: 0, delay: 30, text: "Yep, we keep the original File object in local state until it's either successfully sent or discarded.", replyTo: "msg72" },
  { id: "msg74", sender: 1, delay: 55, text: "Excellent attention to detail! I'm really impressed." },
  { id: "msg75", sender: 1, delay: 10, text: "Let's work on message reactions next." },
  { id: "msg76", sender: 0, delay: 45, text: "Reactions are in the backlog. I was thinking about using a Map in the schema.", replyTo: "msg75" },
  { id: "msg77", sender: 0, delay: 15, text: "Where key is the emoji symbol and value is an array of user IDs." },
  { id: "msg78", sender: 1, delay: 40, text: "That works great. It makes toggle operations super fast via $addToSet and $pull.", replyTo: "msg77" },
  { id: "msg79", sender: 0, delay: 50, text: "Exactly. And we can do optimistic UI updates on the client side so there's zero click latency.", replyTo: "msg78" },
  { id: "msg80", sender: 1, delay: 30, text: "Perfect. Snappy interactions are everything in a chat app.", replyTo: "msg79" },
  { id: "msg81", sender: 0, delay: 40, text: "I'll implement the optimistic reaction state in the local state manager." },
  { id: "msg82", sender: 0, delay: 15, text: "We just need to make sure we handle socket event collisions if two users react simultaneously." },
  { id: "msg83", sender: 1, delay: 45, text: "Good point. The client socket listener should merge the reactions map rather than replacing it.", replyTo: "msg82" },
  { id: "msg84", sender: 0, delay: 50, text: "Right, we'll merge by checking the unique user IDs in the array.", replyTo: "msg83" },
  { id: "msg85", sender: 1, delay: 30, text: "What about message editing? Does that update the updatedAt time?" },
  { id: "msg86", sender: 0, delay: 40, text: "Yes. We update the text and set the `updatedAt` field. The client UI will display an '(edited)' tag next to the timestamp.", replyTo: "msg85" },
  { id: "msg87", sender: 0, delay: 12, text: "But only if the text content actually changed, of course." },
  { id: "msg88", sender: 1, delay: 35, text: "Perfect. And for deleting messages, we should probably do a soft delete or hard delete?", replyTo: "msg86" },
  { id: "msg89", sender: 0, delay: 45, text: "We decided on a hard delete for 1-on-1 chats to respect privacy, but we'll show 'This message was deleted' in the UI temporarily if it had replies.", replyTo: "msg88" },
  { id: "msg90", sender: 1, delay: 50, text: "Ah, so the replies don't become orphaned and lose context. That's a great solution.", replyTo: "msg89" },
  { id: "msg91", sender: 1, delay: 15, text: "It preserves the conversational tree." },
  { id: "msg92", sender: 0, delay: 40, text: "Yes, if the parent message is deleted, the reply UI will just show 'Original message deleted'.", replyTo: "msg90" },
  { id: "msg93", sender: 1, delay: 55, text: "Excellent. Are we going to support message forwarding too?" },
  { id: "msg94", sender: 0, delay: 45, text: "Yes, forwarding is supported. The backend copy endpoint clones the message text or attachments and links it to the new conversation.", replyTo: "msg93" },
  { id: "msg95", sender: 0, delay: 10, text: "And it sets the `isForwarded` flag to true so the client displays a 'Forwarded' header." },
  { id: "msg96", sender: 1, delay: 35, text: "That makes sharing links and messages between chats extremely convenient.", replyTo: "msg94" },
  { id: "msg97", sender: 0, delay: 40, text: "Agreed. I think this covers almost the entire feature set for our MVP." },
  { id: "msg98", sender: 1, delay: 30, text: "Indeed. Let's merge the current branch into main and test the full flow on staging.", replyTo: "msg97" },
  { id: "msg99", sender: 0, delay: 25, text: "I'll do the PR review right now.", replyTo: "msg98" },
  { id: "msg100", sender: 1, delay: 15, text: "Perfect! Let me know if you want to hop on a call to go through it.", replyTo: "msg99" }
];

const generateMessages = async (count = conversationTree.length) => {
  const activeConvo = conversationTree.slice(0, count);
  const idMap = {};
  
  activeConvo.forEach(item => {
    idMap[item.id] = new mongoose.Types.ObjectId();
  });

  // Calculate timestamps backwards from Date.now()
  const delays = activeConvo.map(item => item.delay || 60);
  const totalDelayMs = delays.reduce((sum, d) => sum + d, 0) * 1000;
  let currentMs = Date.now() - totalDelayMs;

  const messages = activeConvo.map((item) => {
    const isSender0 = item.sender === 0;
    currentMs += (item.delay || 60) * 1000;
    const createdAt = new Date(currentMs);

    const messageObject = {
      _id: idMap[item.id],
      conversationId: new mongoose.Types.ObjectId(conversationId),
      senderId: isSender0 ? receipients[0] : receipients[1],
      receiverId: isSender0 ? receipients[1] : receipients[0],
      text: item.text,
      type: "default",
      status: "read",
      createdAt: createdAt,
      updatedAt: createdAt,
    };

    if (item.replyTo && idMap[item.replyTo]) {
      messageObject.replyTo = idMap[item.replyTo];
      messageObject.isReplied = true;
    }

    return messageObject;
  });

  return messages;
};

const seedDatabase = async () => {
  try {
    await ConnectDB();
    
    // Clear old messages for this conversation first to prevent stale/incorrect state
    const deleteResult = await Message.deleteMany({
      conversationId: new mongoose.Types.ObjectId(conversationId),
    });
    console.log(`Cleared ${deleteResult.deletedCount} existing messages for conversation ${conversationId}.`);

    const messages = await generateMessages();
    await Message.insertMany(messages);
    console.log(`Successfully seeded ${messages.length} messages to the database.`);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();

export default generateMessages;