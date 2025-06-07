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
                { name: 'Next Version', value: '`0.9.0`', inline: false },
                { name: 'Coming Commands in `0.9.0`', value: '`/poll`\n `/roleinfo`\n `/quote`\n `/serverbanner`', inline: false },
                { name: 'Lead Dev', value: 'Sleeepy', inline: false },
                { name: 'Note', value: 'This Bot is in its **Beta** phase.' }
            )
            .setColor(0x57F287);

        await interaction.reply({ embeds: [embed] });
    }
};