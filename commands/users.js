const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: [
        new SlashCommandBuilder()
            .setName('userinfo')
            .setDescription('Show information about a user')
            .addUserOption(opt => opt.setName('user').setDescription('User to get info about').setRequired(false)),
        new SlashCommandBuilder()
            .setName('avatar')
            .setDescription('Show a user\'s avatar')
            .addUserOption(opt => opt.setName('user').setDescription('User to get avatar of').setRequired(false))
    ],
    async execute(interaction) {
        if (interaction.commandName === 'userinfo') {
            const user = interaction.options.getUser('user') || interaction.user;
            const member = interaction.guild.members.cache.get(user.id);

            const embed = new EmbedBuilder()
                .setTitle(`${user.tag}'s Info`)
                .setThumbnail(user.displayAvatarURL())
                .addFields(
                    { name: 'ID', value: user.id, inline: true },
                    { name: 'Joined Server', value: member?.joinedAt?.toLocaleString() || 'N/A', inline: true },
                    { name: 'Account Created', value: user.createdAt.toLocaleString(), inline: true }
                )
                .setColor(0x5865F2);

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (interaction.commandName === 'avatar') {
            const user = interaction.options.getUser('user') || interaction.user;
            const embed = new EmbedBuilder()
                .setTitle(`${user.tag}'s Avatar`)
                .setImage(user.displayAvatarURL({ size: 4096 }))
                .setColor(0x5865F2);

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};