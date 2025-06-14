module.exports = {
    name: 'emojisteal',
    /**
     * @param {import('discord.js').ChatInputCommandInteraction} interaction
     * @param {string} url
     * @param {string} emojiName
     * @param {boolean} animated
     */
    async execute(interaction, url, emojiName, animated) {
            try {
                if (!interaction.guild.members.me.permissions.has('ManageEmojisAndStickers')) {
                    return interaction.followUp({ content: '❌ I need the "Manage Emojis and Stickers" permission.', flags: 64 });
                }
    
                const emoji = await interaction.guild.emojis.create({ attachment: url, name: emojiName });
                await interaction.followUp({
                    content: `✅ Emoji added: <${animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`
                });
            } catch (err) {
                await interaction.followUp({ content: `❌ Failed to add emoji: ${err.message}`, flags: 64 });
            }
        }
    };