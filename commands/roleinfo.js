const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roleinfo')
        .setDescription('Show detailed information about a server role')
        .addRoleOption(opt =>
            opt.setName('role')
                .setDescription('The role to get info about')
                .setRequired(true)
        ),
    async execute(interaction) {
        const role = interaction.options.getRole('role');
        const guild = interaction.guild;

        const membersWithRole = guild.members.cache.filter(member => member.roles.cache.has(role.id));
        const permissions = role.permissions.toArray().map(perm => `\`${perm}\``).join(', ') || 'None';

        const embed = new EmbedBuilder()
            .setTitle(`🎭 Role Info: ${role.name}`)
            .setColor(role.color || 0x5865F2)
            .setThumbnail(guild.iconURL())
            .addFields(
                { name: '🆔 Role ID', value: `\`${role.id}\``, inline: true },
                { name: '👥 Members', value: `${membersWithRole.size}`, inline: true },
                { name: '🎨 Color', value: role.hexColor, inline: true },
                { name: '📅 Created', value: `<t:${Math.floor(role.createdTimestamp / 1000)}:F>`, inline: true },
                { name: '📌 Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true },
                { name: '🔝 Hoisted', value: role.hoist ? 'Yes' : 'No', inline: true },
                { name: '🔒 Managed', value: role.managed ? 'Yes' : 'No', inline: true },
                { name: '🔑 Permissions', value: permissions.length > 1024 ? permissions.slice(0, 1021) + '...' : permissions, inline: false }
            )
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};