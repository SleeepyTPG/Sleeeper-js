const { coins, saveCoins, addCoins } = require('../commands/economycommands.js');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (!message.guild || message.author.bot) return;

        const guildId = message.guild.id;
        const userId = message.author.id;

        if (!coins[guildId]) coins[guildId] = {};
        if (!coins[guildId][userId]) coins[guildId][userId] = { balance: 0, lastMsg: 0 };

        const now = Date.now();
        if (now - (coins[guildId][userId].lastMsg || 0) < 60000) return;

        const earned = Math.floor(Math.random() * 5) + 1;
        addCoins(guildId, userId, earned);
        coins[guildId][userId].lastMsg = now;
        saveCoins();
    }
};