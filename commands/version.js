const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { version } = require('../package.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('version')
        .setDescription('Show the bot version.'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Bot Version')
            .setDescription(`Current version: \`${version}\``)
            .addFields(
                { name: 'Next Version', value: '`0.7.0`', inline: true },
                { name: 'Coming Commands in `0.7.0`', value: '`/purge`, `/mute`, `/unmute`, `/suggest`', inline: true },
                { name: 'Lead Dev', value: 'Sleeepy', inline: true },
                { name: 'Note', value: 'This Bot is in its **Beta** phase.' }
            )
            .setColor(0x57F287);

        await interaction.reply({ embeds: [embed] });
    }
};