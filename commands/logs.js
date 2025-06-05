const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

let logChannelId = null;

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
            await interaction.reply({ content: `Logs will be sent to ${logChannel}.`, flags: 64 });
        } else if (logChannelId) {
            await interaction.reply({ content: `Current log channel: <#${logChannelId}>`, flags: 64 });
        } else {
            await interaction.reply({ content: 'No log channel set.', flags: 64 });
        }
    },
    getLogChannelId: () => logChannelId
};