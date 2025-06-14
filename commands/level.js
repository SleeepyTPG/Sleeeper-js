const { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data/levels.json');
const SETTINGS_PATH = path.join(__dirname, '../data/level_settings.json');

let levels = {};
if (fs.existsSync(DATA_PATH)) {
    try {
        levels = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    } catch {
        levels = {};
    }
}

// Load or initialize settings data
let levelSettings = {};
if (fs.existsSync(SETTINGS_PATH)) {
    try {
        levelSettings = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
    } catch {
        levelSettings = {};
    }
}

function saveLevels() {
    fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
    fs.writeFileSync(DATA_PATH, JSON.stringify(levels, null, 2));
}

function saveLevelSettings() {
    fs.mkdirSync(path.dirname(SETTINGS_PATH), { recursive: true });
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(levelSettings, null, 2));
}

function getLevel(xp) {
    return Math.floor(0.2 * Math.sqrt(xp));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('Show your level, another user\'s level, the leaderboard, or set the level-up channel')
        .addSubcommand(sub =>
            sub.setName('me')
                .setDescription('Show your current level and XP')
        )
        .addSubcommand(sub =>
            sub.setName('other')
                .setDescription('Show another user\'s level and XP')
                .addUserOption(opt =>
                    opt.setName('user')
                        .setDescription('The user to check')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName('leaderboard')
                .setDescription('Show the top 10 users by level')
        )
        .addSubcommand(sub =>
            sub.setName('set')
                .setDescription('Set the channel for level-up messages')
                .addChannelOption(opt =>
                    opt.setName('channel')
                        .setDescription('The channel for level-up messages')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)
                )
                .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
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

            await interaction.reply({ embeds: [embed], ephemeral: false });
        }

        if (interaction.options.getSubcommand() === 'other') {
            const user = interaction.options.getUser('user');
            const userId = user.id;
            const userXP = levels[guildId][userId]?.xp || 0;
            const userLevel = getLevel(userXP);
            const nextLevelXP = Math.ceil(Math.pow(userLevel + 1, 2) / 0.04);

            const embed = new EmbedBuilder()
                .setTitle(`🏅 Level for ${user.tag}`)
                .setColor(0x57F287)
                .setDescription(`**Level:** \`${userLevel}\`\n**XP:** \`${userXP}\`\n**Next Level:** \`${nextLevelXP - userXP} XP\` to level ${userLevel + 1}`)
                .setThumbnail(user.displayAvatarURL())
                .setFooter({ text: 'Sleeeper-js Level System' });

            await interaction.reply({ embeds: [embed], ephemeral: false });
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

            await interaction.reply({ embeds: [embed], ephemeral: false });
        }

        if (interaction.options.getSubcommand() === 'set') {
            const channel = interaction.options.getChannel('channel');
            levelSettings[guildId] = { channelId: channel.id };
            saveLevelSettings();
            await interaction.reply({ content: `✅ Level-up messages will now be sent in ${channel}.`, ephemeral: true });
        }
    },
    levels,
    saveLevels,
    getLevel,
    levelSettings,
    saveLevelSettings
};