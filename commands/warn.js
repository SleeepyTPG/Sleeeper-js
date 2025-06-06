const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getLogChannelId } = require('./logs.js');

const warnings = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a user')
        .addUserOption(opt => opt.setName('user').setDescription('User to warn').setRequired(true))
        .addStringOption(opt => opt.setName('reason').setDescription('Reason').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const warnId = warnings.length + 1;
        warnings.push({ id: warnId, user: user.id, reason, mod: interaction.user.id, date: new Date() });

        const embed = new EmbedBuilder()
            .setTitle('User Warned')
            .setDescription(`**User:** <@${user.id}>\n**Reason:** ${reason}\n**Warn ID:** ${warnId}`)
            .setColor(0xED4245)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        const logChannelId = getLogChannelId();
        if (logChannelId) {
            const logChannel = interaction.guild.channels.cache.get(logChannelId);
            if (logChannel) {
                await logChannel.send({
                    content: `⚠️ <@${user.id}> was warned by ${interaction.user.tag} (${interaction.user.id}) for: ${reason} (Warn ID: ${warnId})`
                });
            }
        }
    }
};