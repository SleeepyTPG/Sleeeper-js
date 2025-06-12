const { Client, GatewayIntentBits, Collection, REST, Routes, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { setBotActivities } = require('./activity/activity.js');
const logsCommand = require('./commands/logs.js');
const { logError } = require('./events/errors.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences
    ]
});

client.commands = new Collection();
const commands = [];

const commandFolders = ['commands', 'AI'];
for (const folder of commandFolders) {
    const folderPath = path.join(__dirname, folder);
    if (!fs.existsSync(folderPath)) continue;
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);
        const command = require(filePath);

        if (Array.isArray(command.data)) {
            for (const cmd of command.data) {
                if ('name' in cmd && 'execute' in command) {
                    client.commands.set(cmd.name, { ...command, data: cmd });
                    commands.push(cmd.toJSON());
                }
            }
        } else if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON());
        }
    }
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );
        console.log('Slash commands registered.');
    } catch (error) {
        console.error(error);
    }
    setBotActivities(client);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction, client);
    } catch (error) {
        logError(error, `command:${interaction.commandName}`);
        await interaction.reply({ content: 'There was an error executing this command!', flags: 64 });
    }
});

client.on('messageCreate', async message => {
    if (!message.guild || message.author.bot) return;
    if (!client.automodEnabled) return;
    if (/(https?:\/\/[^\s]+)/gi.test(message.content)) {
        await message.delete().catch(() => {});
        await message.channel.send({ content: `🚫 <@${message.author.id}>, links are not allowed!`, flags: 64 }).catch(() => {});
        const logChannelId = logsCommand.getLogChannelId && logsCommand.getLogChannelId();
        if (logChannelId) {
            const logChannel = message.guild.channels.cache.get(logChannelId);
            if (logChannel) {
                await logChannel.send({ content: `Deleted link from <@${message.author.id}> in <#${message.channel.id}>.` });
            }
        }
    }
});

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.name && typeof event.execute === 'function') {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.login(process.env.DISCORD_TOKEN);