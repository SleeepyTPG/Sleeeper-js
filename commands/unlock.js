const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getLogChannelId } = require('./logs.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Unlock the current channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: '❌ You must be an **Administrator** to use this command.', Flags: 64 });
        }

        await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: true });
        await interaction.reply({ content: '🔓 Channel unlocked.' });

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