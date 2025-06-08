const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const os = require('os');
const fs = require('fs');

const OWNER_ID = '1104736921474834493';

function getCpuUsage() {
    const cpus = os.cpus();
    let user = 0, nice = 0, sys = 0, idle = 0, irq = 0;
    for (let cpu of cpus) {
        user += cpu.times.user;
        nice += cpu.times.nice;
        sys += cpu.times.sys;
        idle += cpu.times.idle;
        irq += cpu.times.irq;
    }
    const total = user + nice + sys + idle + irq;
    return ((total - idle) / total * 100).toFixed(2);
}

function getDiskUsage() {
    try {
        const stat = fs.statSync('/');
        return 'N/A (platform dependent)';
    } catch {
        return 'N/A';
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Show bot status (owner only)'),
    async execute(interaction, client) {
        if (interaction.user.id !== OWNER_ID) {
            return interaction.reply({ content: '❌ This command is only for the bot owner.', ephemeral: true });
        }

        const cpuUsage = getCpuUsage();
        const totalMem = (os.totalmem() / 1024 / 1024).toFixed(0);
        const freeMem = (os.freemem() / 1024 / 1024).toFixed(0);
        const usedMem = totalMem - freeMem;
        const diskUsage = getDiskUsage();

        const guildCount = client.guilds.cache.size;

        let errors = 'None';
        if (fs.existsSync('./error.log')) {
            const errContent = fs.readFileSync('./error.log', 'utf8');
            errors = errContent ? 'See error.log' : 'None';
        }

        const embed = new EmbedBuilder()
            .setTitle('Bot Status')
            .setColor(0x5865F2)
            .addFields(
                { name: 'Utility', value: '** **', inline: false },
                { name: 'CPU Usage', value: `${cpuUsage}%`, inline: true },
                { name: 'RAM Usage', value: `${usedMem}MB / ${totalMem}MB`, inline: true },
                { name: 'Disk Usage', value: diskUsage, inline: true },
                { name: '\u200B', value: '━━━━━━━━━━━━━━━━━━━━━━━', inline: false },
                { name: 'Information', value: '** **', inline: false },
                { name: 'Servers', value: `${guildCount}`, inline: true },
                { name: 'Errors', value: errors, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};