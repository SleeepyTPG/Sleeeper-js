const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ready',
    async execute(client) {
        setInterval(async () => {
            if (!client.activeGiveaways) return;
            for (const [id, g] of Object.entries(client.activeGiveaways)) {
                if (g.ended) continue;
                if (Date.now() >= g.endTime) {
                    client.emit('endGiveaway', null, id, false);
                }
            }
        }, 15000);
    }
};

module.exports.endGiveaway = {
    name: 'endGiveaway',
    /**
     * @param {import('discord.js').Interaction|null} interaction
     * @param {string} messageId
     * @param {boolean} manual
     */
    async execute(interaction, messageId, manual) {
        const client = interaction ? interaction.client : global.client;
        if (!client.activeGiveaways || !client.activeGiveaways[messageId]) return;

        const g = client.activeGiveaways[messageId];
        if (g.ended) return;

        const channel = await client.channels.fetch(g.channelId).catch(() => null);
        if (!channel) return;
        const msg = await channel.messages.fetch(g.messageId).catch(() => null);
        if (!msg) return;

        const users = await msg.reactions.cache.get('🎉')?.users.fetch().catch(() => null);
        const entries = users ? users.filter(u => !u.bot) : [];

        let winners = [];
        if (entries.size > 0) {
            const shuffled = Array.from(entries.values()).sort(() => Math.random() - 0.5);
            winners = shuffled.slice(0, g.winners);
        }

        const embed = EmbedBuilder.from(msg.embeds[0])
            .setColor(0x57F287)
            .setTitle('🎊 Giveaway Ended!')
            .setDescription(
                `**Prize:** ${g.prize}\n**Hosted by:** <@${g.host}>\n\n` +
                (winners.length
                    ? `🎉 Congratulations: ${winners.map(u => `<@${u.id}>`).join(', ')}!`
                    : 'No valid entries!') +
                `\n\n${manual ? '⏹️ Ended early by a moderator.' : '⏰ Ended automatically.'}`
            )
            .setFooter({ text: `Winners: ${g.winners} • Giveaway ID: ${g.messageId}` })
            .setTimestamp();

        await msg.edit({ embeds: [embed] });
        if (winners.length) {
            await channel.send(`🎉 Congratulations ${winners.map(u => `<@${u.id}>`).join(', ')}! You won **${g.prize}**!`);
        } else {
            await channel.send('😢 No valid entries for the giveaway.');
        }

        g.ended = true;
    }
};