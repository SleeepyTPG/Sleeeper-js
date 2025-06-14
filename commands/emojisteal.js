const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('emojisteal')
        .setDescription('Steal an emoji from another server and add it to your own')
        .addStringOption(opt =>
            opt.setName('emoji')
                .setDescription('The custom emoji to steal (e.g. <:name:id> or <a:name:id>)')
                .setRequired(true)
        )
        .addStringOption(opt =>
            opt.setName('name')
                .setDescription('Optional new name for the emoji')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageEmojisAndStickers),
    async execute(interaction) {
        const emojiInput = interaction.options.getString('emoji');
        const customName = interaction.options.getString('name');

        const match = emojiInput.match(/<(a?):(\w+):(\d+)>/);
        if (!match) {
            return interaction.reply({ content: '❌ Please provide a valid custom emoji from another server.', flags: 64 });
        }

        const animated = match[1] === 'a';
        const emojiName = customName || match[2];
        const emojiId = match[3];
        const url = `https://cdn.discordapp.com/emojis/${emojiId}.${animated ? 'gif' : 'png'}?quality=lossless`;

        // Emit custom event for emoji stealing
        interaction.client.emit('emojisteal', interaction, url, emojiName, animated);
        await interaction.reply({ content: `🔄 Attempting to add emoji \`${emojiName}\`...`, flags: 64 });
    }
};