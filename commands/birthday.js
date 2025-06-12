const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data/birthdays.json');

let birthdays = {};
if (fs.existsSync(DATA_PATH)) {
    try {
        birthdays = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    } catch {
        birthdays = {};
    }
}

function saveBirthdays() {
    fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
    fs.writeFileSync(DATA_PATH, JSON.stringify(birthdays, null, 2));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('birthday')
        .setDescription('Set or view your birthday')
        .addSubcommand(sub =>
            sub.setName('set')
                .setDescription('Set your birthday')
                .addIntegerOption(opt =>
                    opt.setName('day')
                        .setDescription('Day (1-31)')
                        .setMinValue(1)
                        .setMaxValue(31)
                        .setRequired(true)
                )
                .addIntegerOption(opt =>
                    opt.setName('month')
                        .setDescription('Month (1-12)')
                        .setMinValue(1)
                        .setMaxValue(12)
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName('view')
                .setDescription('View your saved birthday')
        ),
    async execute(interaction) {
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;
        if (!birthdays[guildId]) birthdays[guildId] = {};

        if (interaction.options.getSubcommand() === 'set') {
            const day = interaction.options.getInteger('day');
            const month = interaction.options.getInteger('month');
            birthdays[guildId][userId] = { day, month };
            saveBirthdays();
            await interaction.reply({ content: `🎂 Your birthday has been set to **${day}/${month}**!`, ephemeral: true });
        }

        if (interaction.options.getSubcommand() === 'view') {
            const entry = birthdays[guildId][userId];
            if (!entry) {
                return interaction.reply({ content: '❌ You have not set your birthday yet. Use `/birthday set`!', ephemeral: true });
            }
            await interaction.reply({ content: `🎉 Your birthday is set to **${entry.day}/${entry.month}**!`, ephemeral: true });
        }
    },
    birthdays,
    saveBirthdays
};