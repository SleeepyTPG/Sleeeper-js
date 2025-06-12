const { SlashCommandBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ask')
        .setDescription('Ask a question and get an AI-powered answer from Google Gemini')
        .addStringOption(opt =>
            opt.setName('question')
                .setDescription('Your question')
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
                content: answer ? `💡 **Answer:** ${answer}` : '❌ No answer received from Gemini.'
            });
        } catch (err) {
            await interaction.editReply({ content: `❌ Error: ${err.message}` });
        }
    }
};