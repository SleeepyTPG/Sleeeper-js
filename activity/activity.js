const { ActivityType } = require('discord.js');

function setBotActivities(client) {
    const activities = [
        () => ({
            name: `over ${client.guilds.cache.size} Servers`,
            type: ActivityType.Watching
        }),
        () => ({
            name: `over ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} users`,
            type: ActivityType.Watching
        }),
        () => ({
            name: 'with Sleeepy',
            type: ActivityType.Playing
        })
    ];

    let i = 0;
    setInterval(() => {
        const activity = activities[i % activities.length](client);
        client.user.setActivity(activity);
        i++;
    }, 10000);
}

module.exports = { setBotActivities };