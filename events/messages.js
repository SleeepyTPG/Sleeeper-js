const { levels, saveLevels, getLevel } = require('../commands/level.js');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (!message.guild || message.author.bot) return;

        const guildId = message.guild.id;
        const userId = message.author.id;

        if (!levels[guildId]) levels[guildId] = {};
        if (!levels[guildId][userId]) levels[guildId][userId] = { xp: 0, last: 0 };

        const now = Date.now();
        if (now - (levels[guildId][userId].last || 0) < 60000) return;

        levels[guildId][userId].xp += Math.floor(Math.random() * 8) + 8;
        levels[guildId][userId].last = now;
        saveLevels();

        const oldLevel = getLevel(levels[guildId][userId].xp - 10);
        const newLevel = getLevel(levels[guildId][userId].xp);
        if (newLevel > oldLevel) {
            message.channel.send(`🎉 <@${userId}> leveled up to **${newLevel}**!`);
        }
    }
};