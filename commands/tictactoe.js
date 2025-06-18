const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tictactoe')
        .setDescription('Play Tic Tac Toe against the bot!'),
    async execute(interaction) {
        const board = Array(9).fill(0);
        interaction.client.activeTicTacToe = interaction.client.activeTicTacToe || {};
        interaction.client.activeTicTacToe[interaction.user.id] = board;

        const embed = new EmbedBuilder()
            .setTitle('❌ Tic Tac Toe ⭕')
            .setDescription('You are ❌. Click a cell to make your move!')
            .setColor(0xFEE75C);

        const getRow = (row) => new ActionRowBuilder().addComponents(
            ...[0, 1, 2].map(i =>
                new ButtonBuilder()
                    .setCustomId(`ttt_${row * 3 + i}`)
                    .setLabel('⬜')
                    .setStyle(ButtonStyle.Secondary)
            )
        );

        await interaction.reply({
            embeds: [embed],
            components: [getRow(0), getRow(1), getRow(2)],
            ephemeral: false
        });
    }
};