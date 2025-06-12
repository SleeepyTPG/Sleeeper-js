const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Start or end a giveaway')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addSubcommand(sub =>
            sub.setName('start')
                .setDescription('Start a new giveaway')
                .addStringOption(opt =>
                    opt.setName('prize')
                        .setDescription('Prize for the giveaway')
                        .setRequired(true)
                )
                .addIntegerOption(opt =>
                    opt.setName('winners')
                        .setDescription('Number of winners')
                        .setMinValue(1)
                        .setMaxValue(10)
                        .setRequired(true)
                )
                .addIntegerOption(opt =>
                    opt.setName('duration')
                        .setDescription('Duration in minutes')
                        .setMinValue(1)
                        .setMaxValue(4320)
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName('end')
                .setDescription('End a giveaway early')
                .addStringOption(opt =>
                    opt.setName('messageid')
                        .setDescription('Message ID of the giveaway')
                        .setRequired(true)
                )
        ),
    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        if (sub === 'start') {
            const prize = interaction.options.getString('prize');
            const winners = interaction.options.getInteger('winners');
            const duration = interaction.options.getInteger('duration');
            const endTime = Date.now() + duration * 60 * 1000;

            const embed = new EmbedBuilder()
                .setTitle('🎉 Giveaway!')
                .setDescription(`**Prize:** ${prize}\n**Hosted by:** <@${interaction.user.id}>\n\nReact with 🎉 to enter!\n\n⏰ Ends: <t:${Math.floor(endTime / 1000)}:R>`)
                .setColor(0xFEE75C)
                .setFooter({ text: `Winners: ${winners} • Giveaway ID: Will appear after creation` })
                .setTimestamp();

            const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
            await msg.react('🎉');

            interaction.client.activeGiveaways = interaction.client.activeGiveaways || {};
            interaction.client.activeGiveaways[msg.id] = {
                prize,
                winners,
                endTime,
                host: interaction.user.id,
                channelId: msg.channel.id,
                messageId: msg.id,
                ended: false
            };

            embed.setFooter({ text: `Winners: ${winners} • Giveaway ID: ${msg.id}` });
            await msg.edit({ embeds: [embed] });
        }

        if (sub === 'end') {
            const messageId = interaction.options.getString('messageid');
            interaction.client.emit('endGiveaway', interaction, messageId, true);
            await interaction.reply({ content: `⏹️ Attempting to end giveaway \`${messageId}\`...`, flags: 64 });
        }
    }
};