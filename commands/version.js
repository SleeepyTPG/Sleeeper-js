const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { version } = require('../package.json');

const RELEASE_DATE = '2025-06-10';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('version')
        .setDescription('Show the bot version.'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('✨ Sleeeper-js Bot Version')
            .setDescription(`> **Current Version:** \`${version}\`\n> **Release Date:** <t:${Math.floor(new Date(RELEASE_DATE).getTime() / 1000)}:F>`)
            .setColor(0x57F287)
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .addFields(
                { name: '🚀 Latest Release', value: '`1.0.0 RELEASED`', inline: false },
                { 
                    name: '🆕 Coming in `1.5.0`', 
                    value: 
                        '• `Economy System` — Let your Members engage in new ways!\n' +
                        '• `/emojisteal` — No more manual emoji stealing!\n',
                    inline: true 
                },
                { name: '👤 Lead Developer', value: 'Sleeepy', inline: false },
                { name: 'ℹ️ Note', value: 'Sleeeper-js is now fully released! Thank you for your support!' }
            )
            .setFooter({ text: 'Sleeeper-js • Discord Bot', iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};