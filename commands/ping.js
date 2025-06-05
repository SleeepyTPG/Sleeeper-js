const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong and latency!'),
    async execute(interaction, client) {
        await interaction.reply({ content: 'Pinging...', flags: 64 });
        const sent = await interaction.fetchReply();
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = client.ws.ping >= 0 ? `${Math.round(client.ws.ping)}ms` : 'N/A';
        await interaction.editReply(`Pong! 🏓 Latency is ${latency}ms. API Latency is ${apiLatency}.`);
    }
};