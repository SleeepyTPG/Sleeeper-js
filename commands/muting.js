const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { getLogChannelId } = require('./logs.js');

function parseDuration(str) {
    if (!str) return null;
    const match = str.match(/^(\d+)([smhd])$/i);
    if (!match) return null;
    const num = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    switch (unit) {
        case 's': return num * 1000;
        case 'm': return num * 60 * 1000;
        case 'h': return num * 60 * 60 * 1000;
        case 'd': return num * 24 * 60 * 60 * 1000;
        default: return null;
    }
}

module.exports = {
    data: [
        new SlashCommandBuilder()
            .setName('mute')
            .setDescription('Mute a member in this server')
            .addUserOption(opt => opt.setName('user').setDescription('User to mute').setRequired(true))
            .addStringOption(opt => opt.setName('duration').setDescription('Mute duration (e.g. 10m, 2h, 1d)').setRequired(true))
            .addStringOption(opt => opt.setName('reason').setDescription('Reason for muting').setRequired(false))
            .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
        new SlashCommandBuilder()
            .setName('unmute')
            .setDescription('Unmute a member in this server')
            .addUserOption(opt => opt.setName('user').setDescription('User to unmute').setRequired(true))
            .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    ],
    async execute(interaction) {
        const command = interaction.commandName;
        const member = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!member) {
            return interaction.reply({ content: '❌ User not found or not in this server.', ephemeral: true });
        }

        if (command === 'mute') {
            const durationStr = interaction.options.getString('duration');
            const durationMs = parseDuration(durationStr);
            if (!durationMs || durationMs < 1000 || durationMs > 28 * 24 * 60 * 60 * 1000) {
                return interaction.reply({ content: '❌ Invalid duration! Use formats like `10m`, `2h`, `1d` (max 28d).', ephemeral: true });
            }
            if (!member.moderatable) {
                return interaction.reply({ content: '❌ I cannot mute this user.', ephemeral: true });
            }
            await member.timeout(durationMs, reason);
            await interaction.reply({ content: `🔇 <@${member.id}> has been muted for **${durationStr}**. Reason: ${reason}` });

            const logChannelId = getLogChannelId();
            if (logChannelId) {
                const logChannel = interaction.guild.channels.cache.get(logChannelId);
                if (logChannel) {
                    await logChannel.send({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('User Muted')
                                .setDescription(`<@${member.id}> was muted by ${interaction.user.tag}\nDuration: **${durationStr}**\nReason: ${reason}`)
                                .setColor(0xED4245)
                                .setTimestamp()
                        ]
                    });
                }
            }
        }

        if (command === 'unmute') {
            if (!member.moderatable) {
                return interaction.reply({ content: '❌ I cannot unmute this user.', ephemeral: true });
            }
            await member.timeout(null, 'Unmuted by command');
            await interaction.reply({ content: `🔊 <@${member.id}> has been unmuted.` });

            // Log
            const logChannelId = getLogChannelId();
            if (logChannelId) {
                const logChannel = interaction.guild.channels.cache.get(logChannelId);
                if (logChannel) {
                    await logChannel.send({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('User Unmuted')
                                .setDescription(`<@${member.id}> was unmuted by ${interaction.user.tag}`)
                                .setColor(0x57F287)
                                .setTimestamp()
                        ]
                    });
                }
            }
        }
    }
};