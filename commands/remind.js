const { SlashCommandBuilder } = require('discord.js');

function parseTime(input) {
    const rel = input.match(/^(\d+)([smhd])$/i);
    if (rel) {
        const num = parseInt(rel[1]);
        const unit = rel[2].toLowerCase();
        switch (unit) {
            case 's': return Date.now() + num * 1000;
            case 'm': return Date.now() + num * 60 * 1000;
            case 'h': return Date.now() + num * 60 * 60 * 1000;
            case 'd': return Date.now() + num * 24 * 60 * 60 * 1000;
        }
    }
    const abs = Date.parse(input);
    if (!isNaN(abs)) return abs;
    return null;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remind')
        .setDescription('Set a reminder for yourself')
        .addStringOption(opt =>
            opt.setName('time')
                .setDescription('Time (e.g. 10m, 1h, 2025-06-10 15:30)')
                .setRequired(true)
        )
        .addStringOption(opt =>
            opt.setName('task')
                .setDescription('What should I remind you about?')
                .setRequired(true)
        ),
    async execute(interaction) {
        const timeInput = interaction.options.getString('time');
        const task = interaction.options.getString('task');
        const remindAt = parseTime(timeInput);

        if (!remindAt || remindAt < Date.now() + 5000) {
            return interaction.reply({
                content: '❌ Invalid time! Use formats like `10m`, `2h`, `1d`, or a date like `2025-06-10 15:30` (at least 5 seconds from now).',
                ephemeral: true
            });
        }

        const ms = remindAt - Date.now();
        const dateStr = new Date(remindAt).toLocaleString();

        await interaction.reply({
            content: `⏰ I will remind you <t:${Math.floor(remindAt / 1000)}:R> about: **${task}**`,
            ephemeral: true
        });

        setTimeout(() => {
            interaction.user.send(`⏰ **Reminder:** ${task}\nTime: ${dateStr}`);
        }, ms);
    }
};