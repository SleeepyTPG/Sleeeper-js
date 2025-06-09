const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getLogChannelId } = require('./logs.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Delete a number of messages from this channel')
        .addIntegerOption(opt =>
            opt.setName('amount')
                .setDescription('Number of messages to delete (2-100)')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        if (amount < 2 || amount > 100) {
            return interaction.reply({ content: '❌ Please provide a number between 2 and 100.', flags: 64 });
        }

        await interaction.channel.bulkDelete(amount, true);
        await interaction.reply({ content: `🧹 Deleted ${amount} messages.`, flags: 64 });

        const logChannelId = getLogChannelId();
        if (logChannelId) {
            const logChannel = interaction.guild.channels.cache.get(logChannelId);
            if (logChannel) {
                await logChannel.send({
                    content: `🧹 ${amount} messages were purged in <#${interaction.channel.id}> by ${interaction.user.tag} (${interaction.user.id})`
                });
            }
        }
    }
};