const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embedbuilder')
        .setDescription('Interactively build and send a custom embed'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Embed Title')
            .setDescription('Embed description here...')
            .setColor(0x5865F2);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('eb_title').setLabel('Set Title').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('eb_desc').setLabel('Set Description').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('eb_color').setLabel('Set Color').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('eb_send').setLabel('Send Embed').setStyle(ButtonStyle.Success)
        );

        interaction.client.embedDrafts = interaction.client.embedDrafts || {};
        interaction.client.embedDrafts[interaction.user.id] = embed;

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
};