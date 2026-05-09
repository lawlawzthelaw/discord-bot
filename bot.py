import discord
import os

TARGET_ROLE_NAME = 'Students'
DM_MESSAGE = 'hora de clase en un rato, confirma tu asistencia en <#1439086525660004413>'

intents = discord.Intents.default()
intents.message_content = True
intents.members = True

client = discord.Client(intents=intents)

@client.event
async def on_ready():
    print(f'Logged in as {client.user}')

@client.event
async def on_message(message):
    if message.author == client.user:
        return

    role = discord.utils.find(
        lambda r: r.name == TARGET_ROLE_NAME,
        message.role_mentions
    )

    if not role:
        return

    sent = 0
    failed = 0
    for member in role.members:
        if member.bot:
            continue
        try:
            await member.send(DM_MESSAGE)
            sent += 1
        except discord.Forbidden:
            failed += 1

    summary = f'Sent DMs to **{sent}** member(s) of @{role.name}'
    if failed:
        summary += f' ({failed} could not be reached — DMs may be disabled)'
    await message.channel.send(summary)

client.run(os.environ['DISCORD_TOKEN'])
