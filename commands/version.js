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
                { name: '🚀 Next Version', value: '`0.9.0`', inline: true },
                { 
                    name: '🆕 Coming in `0.9.0`', 
                    value: 
                        '• `/poll` — Create quick polls with multiple options and voting buttons\n' +
                        '• `/roleinfo` — View detailed info about any server role\n' +
                        '• `/quote` — Save or display memorable server messages\n' +
                        '• `/serverbanner` — Show the server’s banner image in full size', 
                    inline: true 
                },
                { name: '👤 Lead Developer', value: 'Sleeepy', inline: true },
                { name: 'ℹ️ Note', value: 'This bot is in its **Beta** phase.\nThank you for testing and supporting!' }
            )
            .setFooter({ text: 'Sleeeper-js • Discord Bot', iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};