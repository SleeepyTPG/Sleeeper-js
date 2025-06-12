const { SlashCommandBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ask')
        .setDescription('Stelle eine Frage und erhalte eine KI-Antwort von Google Gemini')
        .addStringOption(opt =>
            opt.setName('question')
                .setDescription('Deine Frage')
                .setRequired(true)
        ),
    async execute(interaction) {
        const question = interaction.options.getString('question');
        await interaction.deferReply({ ephemeral: false });

        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

            const result = await model.generateContent(question);
            const response = await result.response;
            const answer = response.text();

            await interaction.editReply({
                content: answer ? `💡 **Antwort:** ${answer}` : '❌ Keine Antwort von Gemini erhalten.'
            });
        } catch (err) {
            await interaction.editReply({ content: `❌ Fehler: ${err.message}` });
        }
    }
};