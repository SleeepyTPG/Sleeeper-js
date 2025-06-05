const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const version = '0.1.0';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('version')
        .setDescription('Show the bot version.'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Bot Version')
            .setDescription(`Current version: \`${version}\``)
            .setColor(0x57F287);

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};