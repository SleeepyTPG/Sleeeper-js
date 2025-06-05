const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get help and useful links!'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Help & Links')
            .setDescription('Need help? Join our support server or check out the GitHub repo!')
            .setColor(0x5865F2)
            .setThumbnail(interaction.client.user.displayAvatarURL());

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('Support Server')
                .setStyle(ButtonStyle.Link)
                .setURL('https://discord.gg/WwApdk4z4H')
                .setEmoji('🛟'),
            new ButtonBuilder()
                .setLabel('GitHub')
                .setStyle(ButtonStyle.Link)
                .setURL('https://github.com/SleeepyTPG/Sleeeper-js')
                .setEmoji('💻')
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    }
};