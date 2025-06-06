const { Events, PermissionFlagsBits } = require('discord.js');
const { getLogChannelId } = require('../commands/logs.js');

module.exports = {
    name: Events.ChannelUpdate,
    async execute(oldChannel, newChannel) {
        if (!newChannel.guild || !newChannel.isTextBased()) return;

        const oldPerms = oldChannel.permissionOverwrites.cache.get(newChannel.guild.roles.everyone.id);
        const newPerms = newChannel.permissionOverwrites.cache.get(newChannel.guild.roles.everyone.id);

        if (oldPerms && newPerms) {
            const oldSend = oldPerms.deny.has(PermissionFlagsBits.SendMessages);
            const newSend = newPerms.deny.has(PermissionFlagsBits.SendMessages);

            if (oldSend !== newSend) {
                const logChannelId = getLogChannelId();
                if (logChannelId) {
                    const logChannel = newChannel.guild.channels.cache.get(logChannelId);
                    if (logChannel) {
                        if (newSend) {
                            await logChannel.send({
                                content: `🔒 <#${newChannel.id}> was locked (Send Messages denied for @everyone).`
                            });
                        } else {
                            await logChannel.send({
                                content: `🔓 <#${newChannel.id}> was unlocked (Send Messages allowed for @everyone).`
                            });
                        }
                    }
                }
            }
        }
    }
};