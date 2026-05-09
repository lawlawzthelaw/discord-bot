import { Client, GatewayIntentBits, Events, type Message } from "discord.js";
import { logger } from "./lib/logger";

const TARGET_ROLE_NAME = "Students";
const DM_MESSAGE =
  "hora de clase en un rato, confirma tu asistencia en <#1439086525660004413>";

export function startBot() {
  const token = process.env["DISCORD_TOKEN"];
  if (!token) {
    logger.warn("DISCORD_TOKEN not set — bot will not start");
    return;
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
    ],
  });

  client.once(Events.ClientReady, (c) => {
    logger.info({ tag: c.user.tag }, "Discord bot logged in");
  });

  client.on(Events.MessageCreate, async (message: Message) => {
    if (message.author.bot) return;
    if (!message.inGuild()) return;

    const role = message.mentions.roles.find(
      (r) => r.name === TARGET_ROLE_NAME,
    );
    if (!role) return;

    await role.guild.members.fetch();

    let sent = 0;
    let failed = 0;

    for (const [, member] of role.members) {
      if (member.user.bot) continue;
      try {
        await member.send(DM_MESSAGE);
        sent++;
      } catch {
        failed++;
      }
    }

    let summary = `Sent DMs to **${sent}** member(s) of @${role.name}`;
    if (failed) {
      summary += ` (${failed} could not be reached — DMs may be disabled)`;
    }
    await message.channel.send(summary);
  });

  client.login(token).catch((err) => {
    logger.error({ err }, "Discord bot failed to login");
  });
}
