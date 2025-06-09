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
                { name: '🚀 Next Version', value: '`1.0.0 RELEASE`', inline: false },
                { 
                    name: '🆕 Coming in `1.0.0 RELEASE`', 
                    value: 
                        '• `/music` — Play music from YouTube and Spotify links\n' +
                        '• `/starboard` — Highlight starred messages in a special channel\n' +
                        '• `/level` — Show your server XP and leaderboard\n' +
                        '• `/giveaway` — Create and manage server giveaways\n' +
                        '• `/ticket` — Open support tickets with staff\n' +
                        '• `/birthday` — Set and announce member birthdays',
                    inline: true 
                },
                { name: '👤 Lead Developer', value: 'Sleeepy', inline: false },
                { name: 'ℹ️ Note', value: 'This bot is in its **Beta** phase.\nThank you for testing and supporting!' }
            )
            .setFooter({ text: 'Sleeeper-js • Discord Bot', iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};