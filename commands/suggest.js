const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

const suggestChannels = {};

module.exports = {
    data: [
        new SlashCommandBuilder()
            .setName('suggest')
            .setDescription('Submit a suggestion')
            .addStringOption(opt =>
                opt.setName('suggestion')
                    .setDescription('Your suggestion')
                    .setRequired(true)
            ),
        new SlashCommandBuilder()
            .setName('setsuggestchannel')
            .setDescription('Set the channel where suggestions will be sent')
            .addChannelOption(opt =>
                opt.setName('channel')
                    .setDescription('Channel for suggestions')
                    .addChannelTypes(ChannelType.GuildText)
                    .setRequired(true)
            )
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    ],
    async execute(interaction) {
        if (interaction.commandName === 'setsuggestchannel') {
            const channel = interaction.options.getChannel('channel');
            suggestChannels[interaction.guild.id] = channel.id;
            await interaction.reply({ content: `✅ Suggestions will now be sent to ${channel}.`, ephemeral: true });
        }

        if (interaction.commandName === 'suggest') {
            const suggestion = interaction.options.getString('suggestion');
            const channelId = suggestChannels[interaction.guild.id];
            if (!channelId) {
                return interaction.reply({ content: '❌ Suggestion channel is not set. Please ask an admin to use `/setsuggestchannel`.', ephemeral: true });
            }
            const channel = interaction.guild.channels.cache.get(channelId);
            if (!channel) {
                return interaction.reply({ content: '❌ The suggestion channel could not be found. Please ask an admin to set it again.', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle('New Suggestion')
                .setDescription(suggestion)
                .setColor(0x5865F2)
                .setFooter({ text: `Suggested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('suggest_accept')
                    .setLabel('Accept')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('suggest_deny')
                    .setLabel('Deny')
                    .setStyle(ButtonStyle.Danger)
            );

            const msg = await channel.send({ embeds: [embed], components: [row] });
            await msg.react('👍');
            await msg.react('👎');

            await interaction.reply({ content: `✅ Your suggestion has been sent to ${channel}.`, ephemeral: true });

            const collector = msg.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 7 * 24 * 60 * 60 * 1000
            });

            collector.on('collect', async i => {
                if (!i.member.permissions.has(PermissionFlagsBits.Administrator)) {
                    return i.reply({ content: '❌ Only administrators can accept or deny suggestions.', ephemeral: true });
                }
                if (i.customId === 'suggest_accept') {
                    embed.setColor(0x57F287)
                        .addFields({ name: 'Status', value: `✅ Accepted by ${i.user.tag}` });
                    await msg.edit({ embeds: [embed], components: [] });
                    await i.reply({ content: 'Suggestion accepted.', ephemeral: true });
                    collector.stop();
                }
                if (i.customId === 'suggest_deny') {
                    embed.setColor(0xED4245)
                        .addFields({ name: 'Status', value: `❌ Denied by ${i.user.tag}` });
                    await msg.edit({ embeds: [embed], components: [] });
                    await i.reply({ content: 'Suggestion denied.', ephemeral: true });
                    collector.stop();
                }
            });
        }
    }
};