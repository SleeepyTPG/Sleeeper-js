const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Show information about this server'),
    async execute(interaction) {
        const { guild } = interaction;

        const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
        const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;
        const categories = guild.channels.cache.filter(c => c.type === 4).size;
        const roles = guild.roles.cache.size;
        const emojis = guild.emojis.cache.size;
        const boosts = guild.premiumSubscriptionCount || 0;
        const boostTier = guild.premiumTier ? `Tier ${guild.premiumTier}` : 'None';

        const embed = new EmbedBuilder()
            .setTitle(`${guild.name} Info`)
            .setThumbnail(guild.iconURL({ size: 512 }))
            .setColor(0x5865F2)
            .addFields(
                { name: 'Server ID', value: guild.id, inline: true },
                { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
                { name: 'Members', value: `${guild.memberCount}`, inline: true },
                { name: 'Created', value: guild.createdAt.toLocaleString(), inline: true },
                { name: 'Channels', value: `Text: ${textChannels}\nVoice: ${voiceChannels}\nCategories: ${categories}`, inline: true },
                { name: 'Roles', value: `${roles}`, inline: true },
                { name: 'Emojis', value: `${emojis}`, inline: true },
                { name: 'Boosts', value: `${boosts} (${boostTier})`, inline: true }
            );

        if (guild.banner) {
            embed.setImage(guild.bannerURL({ size: 1024 }));
        }

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};