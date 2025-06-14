const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data/coins.json');

let coins = {};
if (fs.existsSync(DATA_PATH)) {
    try {
        coins = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    } catch {
        coins = {};
    }
}

function saveCoins() {
    fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
    fs.writeFileSync(DATA_PATH, JSON.stringify(coins, null, 2));
}

function getBalance(guildId, userId) {
    if (!coins[guildId]) coins[guildId] = {};
    if (!coins[guildId][userId]) coins[guildId][userId] = { balance: 0, lastDaily: 0 };
    return coins[guildId][userId].balance;
}

function addCoins(guildId, userId, amount) {
    if (!coins[guildId]) coins[guildId] = {};
    if (!coins[guildId][userId]) coins[guildId][userId] = { balance: 0, lastDaily: 0 };
    coins[guildId][userId].balance += amount;
    saveCoins();
}

function setLastDaily(guildId, userId, timestamp) {
    if (!coins[guildId]) coins[guildId] = {};
    if (!coins[guildId][userId]) coins[guildId][userId] = { balance: 0, lastDaily: 0 };
    coins[guildId][userId].lastDaily = timestamp;
    saveCoins();
}

function getLastDaily(guildId, userId) {
    if (!coins[guildId]) coins[guildId] = {};
    if (!coins[guildId][userId]) coins[guildId][userId] = { balance: 0, lastDaily: 0 };
    return coins[guildId][userId].lastDaily;
}

module.exports = {
    data: [
        new SlashCommandBuilder()
            .setName('balance')
            .setDescription('Check your Sleep Coins balance or another user\'s')
            .addUserOption(opt =>
                opt.setName('user')
                    .setDescription('User to check')
                    .setRequired(false)
            ),
        new SlashCommandBuilder()
            .setName('daily')
            .setDescription('Claim your daily Sleep Coins reward!'),
        new SlashCommandBuilder()
            .setName('pay')
            .setDescription('Send Sleep Coins to another user')
            .addUserOption(opt =>
                opt.setName('user')
                    .setDescription('User to pay')
                    .setRequired(true)
            )
            .addIntegerOption(opt =>
                opt.setName('amount')
                    .setDescription('Amount to send')
                    .setMinValue(1)
                    .setRequired(true)
            ),
        new SlashCommandBuilder()
            .setName('richest')
            .setDescription('Show the Sleep Coin leaderboard'),
        new SlashCommandBuilder()
            .setName('coinflip')
            .setDescription('Bet Sleep Coins on a coin flip')
            .addIntegerOption(opt =>
                opt.setName('amount')
                    .setDescription('Amount to bet')
                    .setMinValue(1)
                    .setRequired(true)
            ),
        new SlashCommandBuilder()
            .setName('slots')
            .setDescription('Play the slot machine for Sleep Coins')
            .addIntegerOption(opt =>
                opt.setName('amount')
                    .setDescription('Amount to bet')
                    .setMinValue(1)
                    .setRequired(true)
            ),
    ],
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const userId = interaction.user.id;

        if (interaction.commandName === 'balance') {
            const user = interaction.options.getUser('user') || interaction.user;
            const bal = getBalance(guildId, user.id);
            const embed = new EmbedBuilder()
                .setTitle(`💰 Sleep Coins Balance`)
                .setDescription(`**${user.tag}** has **${bal}** 💤 Sleep Coins!`)
                .setColor(0xFEE75C)
                .setThumbnail(user.displayAvatarURL());
            return interaction.reply({ embeds: [embed], ephemeral: false });
        }

        if (interaction.commandName === 'daily') {
            const now = Date.now();
            const last = getLastDaily(guildId, userId);
            if (now - last < 24 * 60 * 60 * 1000) {
                const next = Math.ceil((last + 24 * 60 * 60 * 1000 - now) / (60 * 60 * 1000));
                return interaction.reply({ content: `⏳ You already claimed your daily! Try again in **${next}** hour(s).`, flags: 64 });
            }
            const reward = Math.floor(Math.random() * 100) + 100;
            addCoins(guildId, userId, reward);
            setLastDaily(guildId, userId, now);
            return interaction.reply({ content: `🎁 You claimed your daily reward of **${reward}** 💤 Sleep Coins!`, flags: 64 });
        }

        if (interaction.commandName === 'pay') {
            const target = interaction.options.getUser('user');
            const amount = interaction.options.getInteger('amount');
            if (target.id === userId) return interaction.reply({ content: '❌ You cannot pay yourself.', flags: 64 });
            if (amount < 1) return interaction.reply({ content: '❌ Amount must be at least 1.', flags: 64 });
            if (getBalance(guildId, userId) < amount) return interaction.reply({ content: '❌ You do not have enough Sleep Coins.', flags: 64 });

            addCoins(guildId, userId, -amount);
            addCoins(guildId, target.id, amount);
            return interaction.reply({ content: `✅ You sent **${amount}** 💤 Sleep Coins to **${target.tag}**!`, flags: 64 });
        }

        if (interaction.commandName === 'richest') {
            const guildCoins = coins[guildId] || {};
            const sorted = Object.entries(guildCoins)
                .sort(([, a], [, b]) => (b.balance || 0) - (a.balance || 0))
                .slice(0, 10);

            let desc = '';
            for (let i = 0; i < sorted.length; i++) {
                const [uid, data] = sorted[i];
                const member = await interaction.guild.members.fetch(uid).catch(() => null);
                desc += `**${i + 1}.** ${member ? member.user.tag : `<@${uid}>`} — **${data.balance}** 💤\n`;
            }
            if (!desc) desc = 'No one has any Sleep Coins yet!';

            const embed = new EmbedBuilder()
                .setTitle(`🏆 Sleep Coin Leaderboard`)
                .setColor(0xFEE75C)
                .setDescription(desc);

            return interaction.reply({ embeds: [embed], ephemeral: false });
        }

        if (interaction.commandName === 'coinflip') {
            const amount = interaction.options.getInteger('amount');
            if (getBalance(guildId, userId) < amount) return interaction.reply({ content: '❌ You do not have enough Sleep Coins.', flags: 64 });

            const result = Math.random() < 0.5 ? 'heads' : 'tails';
            const win = Math.random() < 0.5;
            if (win) {
                addCoins(guildId, userId, amount);
                return interaction.reply({ content: `🪙 The coin landed on **${result}**! You won **${amount}** 💤 Sleep Coins!`, flags: 64 });
            } else {
                addCoins(guildId, userId, -amount);
                return interaction.reply({ content: `🪙 The coin landed on **${result}**! You lost **${amount}** 💤 Sleep Coins!`, flags: 64 });
            }
        }

        if (interaction.commandName === 'slots') {
            const amount = interaction.options.getInteger('amount');
            if (getBalance(guildId, userId) < amount) return interaction.reply({ content: '❌ You do not have enough Sleep Coins.', flags: 64 });

            const symbols = ['🍒', '🍋', '🍉', '🍇', '💤'];
            const spin = [0, 0, 0].map(() => symbols[Math.floor(Math.random() * symbols.length)]);
            let win = false;
            let winAmount = 0;
            if (spin.every(s => s === '💤')) {
                win = true;
                winAmount = amount * 10;
            } else if (spin[0] === spin[1] && spin[1] === spin[2]) {
                win = true;
                winAmount = amount * 5;
            } else if (spin.filter(s => s === '💤').length === 2) {
                win = true;
                winAmount = amount * 3;
            }

            let resultMsg = `🎰 | ${spin.join(' | ')} |\n`;
            if (win) {
                addCoins(guildId, userId, winAmount);
                resultMsg += `**You won ${winAmount} 💤 Sleep Coins!**`;
            } else {
                addCoins(guildId, userId, -amount);
                resultMsg += `**You lost ${amount} 💤 Sleep Coins!**`;
            }
            return interaction.reply({ content: resultMsg, flags: 64 });
        }
    },
    coins,
    saveCoins,
    getBalance,
    addCoins
};