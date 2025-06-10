const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('Play music from a YouTube or Spotify link')
        .addStringOption(opt =>
            opt.setName('url')
                .setDescription('YouTube or Spotify link')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Connect | PermissionFlagsBits.Speak),
    async execute(interaction) {
        const url = interaction.options.getString('url');
        if (!url.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|spotify\.com)\//i)) {
            return interaction.reply({ content: '❌ Please provide a valid YouTube or Spotify link.', flags: 64 });
        }

        const member = interaction.member;
        const voiceChannel = member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply({ content: '❌ You must be in a voice channel to play music.', flags: 64 });
        }

        const permissions = voiceChannel.permissionsFor(interaction.client.user);
        if (!permissions.has('Connect') || !permissions.has('Speak')) {
            return interaction.reply({ content: '❌ I need permission to join and speak in your voice channel.', flags: 64 });
        }

        interaction.client.emit('playMusic', interaction, url, voiceChannel);
        await interaction.reply({ content: '🎶 Added to queue! Use `/music` again to add more.', flags: 64 });
    }
};