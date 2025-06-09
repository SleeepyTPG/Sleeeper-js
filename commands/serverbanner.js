const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverbanner')
        .setDescription('Show the server banner in full size'),
    async execute(interaction) {
        const guild = interaction.guild;

        if (!guild.banner) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('🏳️ Server Banner')
                        .setDescription('No server banner is set for this server.')
                        .setColor(0xED4245)
                        .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                        .setTimestamp()
                ],
                ephemeral: true
            });
        }

        const bannerUrl = guild.bannerURL({ size: 4096 });

        const embed = new EmbedBuilder()
            .setTitle(`🏳️ Server Banner for ${guild.name}`)
            .setImage(bannerUrl)
            .setColor(0x5865F2)
            .setDescription(`[Click here to open full banner](${bannerUrl})`)
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};