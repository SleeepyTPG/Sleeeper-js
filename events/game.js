const { addCoins } = require('../commands/economycommands.js');
const { EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (interaction.isButton() && interaction.customId.startsWith('rps_')) {
            const userChoice = interaction.customId.split('_')[1];
            const choices = ['rock', 'paper', 'scissors'];
            const botChoice = choices[Math.floor(Math.random() * 3)];
            let result;
            if (userChoice === botChoice) result = 'It\'s a draw!';
            else if (
                (userChoice === 'rock' && botChoice === 'scissors') ||
                (userChoice === 'paper' && botChoice === 'rock') ||
                (userChoice === 'scissors' && botChoice === 'paper')
            ) {
                result = 'You win! (+10 💤)';
                addCoins(interaction.guild.id, interaction.user.id, 10);
            } else {
                result = 'You lose!';
            }
            await interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('🪨 Rock, 📄 Paper, ✂️ Scissors!')
                        .setDescription(`You chose **${userChoice}**\nBot chose **${botChoice}**\n\n**${result}**`)
                        .setColor(0x5865F2)
                ],
                components: []
            });
        }

        if (interaction.isButton() && interaction.customId.startsWith('guess_')) {
            const guess = parseInt(interaction.customId.split('_')[1]);
            const number = interaction.client.activeGuesses?.[interaction.user.id];
            let result;
            if (guess === number) {
                result = '🎉 Correct! You win 20 💤 Sleep Coins!';
                addCoins(interaction.guild.id, interaction.user.id, 20);
            } else {
                result = `❌ Wrong! The number was **${number}**.`;
            }
            await interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('🔢 Guess the Number!')
                        .setDescription(result)
                        .setColor(guess === number ? 0x57F287 : 0xED4245)
                ],
                components: []
            });
            delete interaction.client.activeGuesses[interaction.user.id];
        }

        if (interaction.isButton() && interaction.customId.startsWith('ttt_')) {
            const idx = parseInt(interaction.customId.split('_')[1]);
            const board = interaction.client.activeTicTacToe?.[interaction.user.id];
            if (!board || board[idx] !== 0) return interaction.reply({ content: 'Invalid move!', ephemeral: true });

            board[idx] = 1;

            // Check win
            const winPatterns = [
                [0,1,2],[3,4,5],[6,7,8], 
                [0,3,6],[1,4,7],[2,5,8], 
                [0,4,8],[2,4,6]          
            ];
            const checkWin = (b, p) => winPatterns.some(pat => pat.every(i => b[i] === p));
            if (checkWin(board, 1)) {
                addCoins(interaction.guild.id, interaction.user.id, 30);
                return interaction.update({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('❌ Tic Tac Toe ⭕')
                            .setDescription('You win! (+30 💤 Sleep Coins)')
                            .setColor(0x57F287)
                    ],
                    components: []
                });
            }
            if (board.every(cell => cell !== 0)) {
                return interaction.update({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('❌ Tic Tac Toe ⭕')
                            .setDescription('It\'s a draw!')
                            .setColor(0xFEE75C)
                    ],
                    components: []
                });
            }

            const empty = board.map((v, i) => v === 0 ? i : null).filter(i => i !== null);
            const botMove = empty[Math.floor(Math.random() * empty.length)];
            board[botMove] = 2;

            const getLabel = (v) => v === 1 ? '❌' : v === 2 ? '⭕' : '⬜';
            const getRow = (row) => new ActionRowBuilder().addComponents(
                ...[0, 1, 2].map(i =>
                    new ButtonBuilder()
                        .setCustomId(`ttt_${row * 3 + i}`)
                        .setLabel(getLabel(board[row * 3 + i]))
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(board[row * 3 + i] !== 0)
                )
            );

            if (checkWin(board, 2)) {
                return interaction.update({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('❌ Tic Tac Toe ⭕')
                            .setDescription('Bot wins! Try again!')
                            .setColor(0xED4245)
                    ],
                    components: [getRow(0), getRow(1), getRow(2)]
                });
            }

            if (board.every(cell => cell !== 0)) {
                return interaction.update({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('❌ Tic Tac Toe ⭕')
                            .setDescription('It\'s a draw!')
                            .setColor(0xFEE75C)
                    ],
                    components: [getRow(0), getRow(1), getRow(2)]
                });
            }

            await interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('❌ Tic Tac Toe ⭕')
                        .setDescription('Your move!')
                        .setColor(0xFEE75C)
                ],
                components: [getRow(0), getRow(1), getRow(2)]
            });
        }
    }
};