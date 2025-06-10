const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data/quotes.json');

let quotes = {};
if (fs.existsSync(DATA_PATH)) {
    try {
        quotes = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    } catch {
        quotes = {};
    }
}

function saveQuotes() {
    fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
    fs.writeFileSync(DATA_PATH, JSON.stringify(quotes, null, 2));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quote')
        .setDescription('Add or view funny server quotes')
        .addSubcommand(sub =>
            sub.setName('add')
                .setDescription('Add a new quote')
                .addStringOption(opt =>
                    opt.setName('text')
                        .setDescription('The quote text')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('Show all quotes for this server')
        ),
    async execute(interaction) {
        const guildId = interaction.guild.id;

        if (interaction.options.getSubcommand() === 'add') {
            const text = interaction.options.getString('text');
            if (!quotes[guildId]) quotes[guildId] = [];
            quotes[guildId].push({ text, user: interaction.user.tag, date: new Date().toISOString() });
            saveQuotes();

            await interaction.reply({
                content: `💬 Quote added: "${text}"`,
                ephemeral: false
            });
        }

        if (interaction.options.getSubcommand() === 'list') {
            const serverQuotes = quotes[guildId] || [];
            if (serverQuotes.length === 0) {
                return interaction.reply({ content: 'No quotes saved for this server yet!', Flags: 64 });
            }

            const embed = new EmbedBuilder()
                .setTitle(`📚 Quotes for ${interaction.guild.name}`)
                .setColor(0x5865F2)
                .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            let desc = '';
            serverQuotes.slice(0, 10).forEach((q, i) => {
                desc += `**#${i + 1}:** "${q.text}" — *${q.user}*\n`;
            });
            if (serverQuotes.length > 10) desc += `\n...and ${serverQuotes.length - 10} more!`;

            embed.setDescription(desc);

            await interaction.reply({ embeds: [embed] });
        }
    }
};