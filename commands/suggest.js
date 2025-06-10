const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data/suggestions.json');

let suggestChannels = {};
let suggestionCounter = 1;

if (fs.existsSync(DATA_PATH)) {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
        suggestChannels = data.suggestChannels || {};
        suggestionCounter = data.suggestionCounter || 1;
    } catch (e) {
        console.error('Failed to load suggestions data:', e);
    }
}

function saveSuggestions() {
    fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
    fs.writeFileSync(DATA_PATH, JSON.stringify({ suggestChannels, suggestionCounter }, null, 2));
}

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
            saveSuggestions();
            await interaction.reply({ content: `✅ Suggestions will now be sent to ${channel}.`, Flags: 64 });
        }

        if (interaction.commandName === 'suggest') {
            const suggestion = interaction.options.getString('suggestion');
            const channelId = suggestChannels[interaction.guild.id];
            if (!channelId) {
                return interaction.reply({ content: '❌ Suggestion channel is not set. Please ask an admin to use `/setsuggestchannel`.', Flags: 64 });
            }
            const channel = interaction.guild.channels.cache.get(channelId);
            if (!channel) {
                return interaction.reply({ content: '❌ The suggestion channel could not be found. Please ask an admin to set it again.', Flags: 64 });
            }

            const suggestionNumber = suggestionCounter++;
            saveSuggestions();

            let upvotes = 0;
            let downvotes = 0;
            let votedUsers = new Set();

            const embed = new EmbedBuilder()
                .setTitle(`Suggestion #${suggestionNumber}`)
                .setDescription(`\`${suggestion}\``)
                .setColor(0x5865F2)
                .setFooter({ text: `Suggested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp()
                .addFields(
                    { name: 'Upvotes', value: `${upvotes}`, inline: true },
                    { name: 'Downvotes', value: `${downvotes}`, inline: true }
                );

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('suggest_upvote')
                    .setLabel('Upvote')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('👍'),
                new ButtonBuilder()
                    .setCustomId('suggest_downvote')
                    .setLabel('Downvote')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('👎'),
                new ButtonBuilder()
                    .setCustomId('suggest_accept')
                    .setLabel('Accept')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('✅'),
                new ButtonBuilder()
                    .setCustomId('suggest_deny')
                    .setLabel('Deny')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('❌')
            );

            const msg = await channel.send({ embeds: [embed], components: [row] });

            await interaction.reply({ content: `✅ Your suggestion (#${suggestionNumber}) has been sent to ${channel}.`, Flags: 64 });

            const collector = msg.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 7 * 24 * 60 * 60 * 1000
            });

            collector.on('collect', async i => {
                if (i.customId === 'suggest_upvote' || i.customId === 'suggest_downvote') {
                    if (votedUsers.has(i.user.id)) {
                        return i.reply({ content: '❌ You have already voted on this suggestion.', Flags: 64 });
                    }
                    if (i.customId === 'suggest_upvote') upvotes++;
                    if (i.customId === 'suggest_downvote') downvotes++;
                    votedUsers.add(i.user.id);

                    embed.data.fields[0].value = `${upvotes}`;
                    embed.data.fields[1].value = `${downvotes}`;
                    await msg.edit({ embeds: [embed], components: [row] });
                    await i.reply({ content: '✅ Vote registered!', Flags: 64 });
                    return;
                }

                if (!i.member.permissions.has(PermissionFlagsBits.Administrator)) {
                    return i.reply({ content: '❌ Only administrators can accept or deny suggestions.', Flags: 64 });
                }
                if (i.customId === 'suggest_accept') {
                    embed.setColor(0x57F287)
                        .addFields({ name: 'Status', value: `✅ Accepted by ${i.user.tag}` });
                    await msg.edit({ embeds: [embed], components: [] });
                    await i.reply({ content: 'Suggestion accepted.', Flags: 64 });
                    collector.stop();
                }
                if (i.customId === 'suggest_deny') {
                    embed.setColor(0xED4245)
                        .addFields({ name: 'Status', value: `❌ Denied by ${i.user.tag}` });
                    await msg.edit({ embeds: [embed], components: [] });
                    await i.reply({ content: 'Suggestion denied.', Flags: 64 });
                    collector.stop();
                }
            });
        }
    }
};