import { ActivityType, Client, Events, GatewayIntentBits } from "discord.js";
import { config } from "dotenv";
import { checkMsgContent, query } from "./util";
config();
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});
const TOKEN: string = String(process.env.TOKEN);
const PREFIX: string = String(process.env.PREFIX);
const DEFAULT_MSG: string = String(process.env.DEFAULT_MSG);

client.on(Events.ClientReady, () => {
  console.log(`LOG IN SUCCESSFUL: ${client.user?.tag}`);
  if (!client.user?.avatar) {
    client.user?.setPresence({
      activities: [{ name: "fucking stupid", type: ActivityType.Playing }],
    });
    try {
      client.user?.setAvatar("./avatar.png");
      console.log("AVATAR UPDATED");
    } catch (err) {
      console.error(`CANNOT SET AVATAR: ${err}`);
    }
  }
});

client.on(Events.MessageCreate, async (message) => {
  if (message.reference) {
    const originalMessage = message.channel.messages.cache.get(
      message.reference.messageId!
    );
    if (originalMessage?.author.id === client.user?.id && !message.system) {
      message.channel.sendTyping();
      const response = await query(
        `${originalMessage?.content} ${message.content}`
      );
      message.reply(response);
    }
  }

  if (checkMsgContent(message.content, PREFIX) && !message.author.bot && !message.reference) {
    //verify message contains activation string and does not come from another bot and is not a reply
    const promptToAI = message.content
      .toLowerCase()
      .replace(PREFIX, "")
      .trim();
    //filter out activation string from original message
    message.channel.sendTyping();
    if (promptToAI.length === 0) {
      await message.channel.send(DEFAULT_MSG);
      return;
    }
    const response = await query(promptToAI.trim());
    await message.channel.send(response);
  }
});

client.on(Events.ShardError, (err) => {
  console.error(`DISCORD ERRORR: ${err}`);
});

client.on(Events.ShardDisconnect, (event) => {
  console.warn(`DISCONNECTED FROM DISCORD: ${event}`);
});

client.on(Events.ShardReconnecting, () => {
  console.log("RECONNECTING TO DISCORD");
});

client.on(Events.ShardResume, () => {
  console.log("RESUME NORMAL OPERATION");
});

client.login(TOKEN);
