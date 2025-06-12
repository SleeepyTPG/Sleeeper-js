const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, getVoiceConnection, NoSubscriberBehavior } = require('@discordjs/voice');
const play = require('play-dl');

const queues = new Map();

module.exports = {
    name: 'playMusic',
    /**
     * @param {import('discord.js').ChatInputCommandInteraction}
     * @param {string}
     * @param {import('discord.js').VoiceChannel}
     */
    async execute(interaction, url, voiceChannel) {
        const guildId = voiceChannel.guild.id;
        if (!queues.has(guildId)) {
            queues.set(guildId, []);
        }
        const queue = queues.get(guildId);
        queue.push({ url, requestedBy: interaction.user.tag });

        if (queue.playing) return;

        queue.playing = true;

        let connection = getVoiceConnection(guildId);
        if (!connection) {
            connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: guildId,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator
            });
        }

        const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause } });
        connection.subscribe(player);

        async function playNext() {
            if (queue.length === 0) {
                queue.playing = false;
                connection.destroy();
                return;
            }
            const track = queue.shift();
            let stream;
            let title = track.url;
            try {
                if (track.url.includes('spotify.com')) {
                    const info = await play.spotify(track.url);
                    const yt = await play.search(`${info.name} ${info.artists[0].name}`, { limit: 1 });
                    if (!yt.length) throw new Error('No YouTube equivalent found for this Spotify track.');
                    stream = await play.stream(yt[0].url);
                    title = yt[0].title;
                } else {
                    const ytInfo = await play.video_info(track.url);
                    stream = await play.stream(track.url);
                    title = ytInfo.video_details.title;
                }
            } catch (err) {
                await interaction.followUp({ content: `❌ Could not play this track: ${err.message}`, flags: 64 });
                return playNext();
            }

            const resource = createAudioResource(stream.stream, { inputType: stream.type });
            player.play(resource);

            await interaction.followUp({ content: `▶️ Now playing: **${title}** (requested by ${track.requestedBy})` });

            player.once(AudioPlayerStatus.Idle, playNext);
        }

        playNext();
    }
};