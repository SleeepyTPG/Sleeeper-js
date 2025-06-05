const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getLogChannelId } = require('./logs.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Unlock the current channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
        await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: true });
        await interaction.reply({ content: '🔓 Channel unlocked.', flags: 64 });

        const logChannelId = getLogChannelId();
        if (logChannelId) {
            const logChannel = interaction.guild.channels.cache.get(logChannelId);
            if (logChannel) {
                await logChannel.send({
                    content: `🔓 <#${interaction.channel.id}> was unlocked by ${interaction.user.tag} (${interaction.user.id})`
                });
            }
        }
    }
};