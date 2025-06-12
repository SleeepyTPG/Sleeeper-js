const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data/levels.json');

let levels = {};
if (fs.existsSync(DATA_PATH)) {
    try {
        levels = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    } catch {
        levels = {};
    }
}

function saveLevels() {
    fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
    fs.writeFileSync(DATA_PATH, JSON.stringify(levels, null, 2));
}

function getLevel(xp) {
    return Math.floor(0.2 * Math.sqrt(xp));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('Show your level or the leaderboard')
        .addSubcommand(sub =>
            sub.setName('me')
                .setDescription('Show your current level and XP')
        )
        .addSubcommand(sub =>
            sub.setName('leaderboard')
                .setDescription('Show the top 10 users by level')
        ),
    async execute(interaction) {
        const guildId = interaction.guild.id;
        if (!levels[guildId]) levels[guildId] = {};

        if (interaction.options.getSubcommand() === 'me') {
            const userId = interaction.user.id;
            const userXP = levels[guildId][userId]?.xp || 0;
            const userLevel = getLevel(userXP);
            const nextLevelXP = Math.ceil(Math.pow(userLevel + 1, 2) / 0.04);

            const embed = new EmbedBuilder()
                .setTitle(`🏅 Level for ${interaction.user.tag}`)
                .setColor(0x57F287)
                .setDescription(`**Level:** \`${userLevel}\`\n**XP:** \`${userXP}\`\n**Next Level:** \`${nextLevelXP - userXP} XP\` to level ${userLevel + 1}`)
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter({ text: 'Sleeeper-js Level System' });

            await interaction.reply({ embeds: [embed] });
        }

        if (interaction.options.getSubcommand() === 'leaderboard') {
            const guildLevels = levels[guildId] || {};
            const sorted = Object.entries(guildLevels)
                .sort(([, a], [, b]) => (b.xp || 0) - (a.xp || 0))
                .slice(0, 10);

            let desc = '';
            for (let i = 0; i < sorted.length; i++) {
                const [userId, data] = sorted[i];
                const member = await interaction.guild.members.fetch(userId).catch(() => null);
                desc += `**${i + 1}.** ${member ? member.user.tag : `<@${userId}>`} — Level \`${getLevel(data.xp)}\` (\`${data.xp} XP\`)\n`;
            }
            if (!desc) desc = 'No one has earned XP yet!';

            const embed = new EmbedBuilder()
                .setTitle(`🏆 Level Leaderboard for ${interaction.guild.name}`)
                .setColor(0xFEE75C)
                .setDescription(desc)
                .setFooter({ text: 'Sleeeper-js Level System' });

            await interaction.reply({ embeds: [embed] });
        }
    },
    levels,
    saveLevels,
    getLevel
};