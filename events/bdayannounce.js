const { birthdays, saveBirthdays } = require('../commands/birthday.js');

module.exports = {
    name: 'ready',
    async execute(client) {
        setInterval(async () => {
            const today = new Date();
            const day = today.getDate();
            const month = today.getMonth() + 1;

            for (const [guildId, users] of Object.entries(birthdays)) {
                const guild = client.guilds.cache.get(guildId);
                if (!guild) continue;

                for (const [userId, entry] of Object.entries(users)) {
                    if (entry.day === day && entry.month === month && !entry.congratulated) {
                        const member = await guild.members.fetch(userId).catch(() => null);
                        if (member) {
                            const channel = guild.systemChannel || guild.publicUpdatesChannel || guild.channels.cache.find(c => c.isTextBased() && c.permissionsFor(guild.members.me).has('SendMessages'));
                            if (channel) {
                                await channel.send(`🎉 Happy Birthday <@${userId}>! 🎂`);
                            }
                        }
                        entry.congratulated = true;
                        saveBirthdays();
                    }
                    if ((entry.day !== day || entry.month !== month) && entry.congratulated) {
                        entry.congratulated = false;
                        saveBirthdays();
                    }
                }
            }
        }, 60 * 60 * 1000);
    }
};