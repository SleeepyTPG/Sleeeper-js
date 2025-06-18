const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { version } = require('../package.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('version')
        .setDescription('Show the bot version.'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('✨ Sleeeper-js Bot Version')
            .setDescription(`> **Current Version:** \`${version}\`\n> **Latest Release:** \`v2.0.0\`\n> **Next Update:** \`v2.5.0\``)
            .setColor(0x57F287)
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .addFields(
                { name: '🚀 Latest Release', value: '`v2.0.0`', inline: false },
                { 
                    name: '🆕 Coming in `v2.5.0`', 
                    value: 
                        '• `/counting` — Count to infinity with your friends!\n' +
                        '• `/autorole` — Set an Role that is added to new members!\n',
                    inline: true 
                },
                { name: '👤 Lead Developer', value: 'Sleeepy', inline: false },
                { name: 'ℹ️ Note', value: 'Sleeeper-js is now on v2.0.0! Thank you for your support!' }
            )
            .setFooter({ text: 'Sleeeper-js • Discord Bot', iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};