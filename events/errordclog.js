const { getLogChannelId } = require('../commands/logs.js');

/**
 * Logs any error (not just command errors) to the configured Discord log channel.
 * @param {object} client - The Discord client.
 * @param {string|Error} error - The error object or string.
 * @param {object} [context] - Optional context info (e.g. { source: 'uncaughtException' }).
 */
async function logAnyErrorToDiscord(client, error, context = {}) {
    try {
        const logChannelId = getLogChannelId && getLogChannelId();
        if (!logChannelId) return;

        let logChannel = null;
        for (const guild of client.guilds.cache.values()) {
            logChannel = guild.channels.cache.get(logChannelId);
            if (logChannel) break;
        }
        if (!logChannel) return;

        const errorText = typeof error === 'string' ? error : (error.stack || error.toString());
        const contextText = context && context.source ? `**Source:** \`${context.source}\`\n` : '';

        await logChannel.send({
            embeds: [
                {
                    title: '❗ Error',
                    description: `${contextText}**Error:** \`\`\`${errorText}\`\`\``,
                    color: 0xED4245,
                    timestamp: new Date().toISOString()
                }
            ]
        });
    } catch (e) {
        console.error('Failed to log error to Discord:', e);
    }
}

module.exports = { logAnyErrorToDiscord };