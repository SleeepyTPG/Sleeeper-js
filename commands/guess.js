const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guess')
        .setDescription('Guess the number (1-5) and win Sleep Coins!'),
    async execute(interaction) {
        const number = Math.floor(Math.random() * 5) + 1;
        interaction.client.activeGuesses = interaction.client.activeGuesses || {};
        interaction.client.activeGuesses[interaction.user.id] = number;

        const embed = new EmbedBuilder()
            .setTitle('🔢 Guess the Number!')
            .setDescription('Pick a number between 1 and 5. If you guess right, you win 20 Sleep Coins!')
            .setColor(0x57F287);

        const row = new ActionRowBuilder().addComponents(
            ...[1, 2, 3, 4, 5].map(n =>
                new ButtonBuilder()
                    .setCustomId(`guess_${n}`)
                    .setLabel(n.toString())
                    .setStyle(ButtonStyle.Secondary)
            )
        );

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: false });
    }
};