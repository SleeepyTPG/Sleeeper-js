const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data/logchannel.json');

let logChannelId = null;

if (fs.existsSync(DATA_PATH)) {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
        logChannelId = data.logChannelId || null;
    } catch (e) {
        console.error('Failed to load log channel data:', e);
    }
}

function saveLogChannel() {
    fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
    fs.writeFileSync(DATA_PATH, JSON.stringify({ logChannelId }, null, 2));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('logs')
        .setDescription('Set or view the moderation log channel')
        .addChannelOption(opt => opt.setName('channel').setDescription('Channel to log to').addChannelTypes(ChannelType.GuildText))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
        const logChannel = interaction.options.getChannel('channel');
        if (logChannel) {
            logChannelId = logChannel.id;
            saveLogChannel();
            await interaction.reply({ content: `Logs will be sent to ${logChannel}.`, flags: 64 });
        } else if (logChannelId) {
            await interaction.reply({ content: `Current log channel: <#${logChannelId}>`, flags: 64 });
        } else {
            await interaction.reply({ content: 'No log channel set.', flags: 64 });
        }
    },
    getLogChannelId: () => logChannelId
};