const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getLogChannelId } = require('./logs.js'); // Add this line

const automodTypes = [
    { name: 'anti-link', description: 'Block messages containing links' },
    { name: 'anti-spam', description: 'Block repeated messages' },
    { name: 'anti-invite', description: 'Block Discord invite links' },
    { name: 'anti-mention', description: 'Block excessive mentions' },
    { name: 'anti-emoji', description: 'Block messages with too many emojis' },
    { name: 'anti-caps', description: 'Block messages with excessive capital letters' }
];

const automodSettings = {};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('automod')
        .setDescription('Automod configuration')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommandGroup(group =>
            group.setName('preset')
                .setDescription('Enable/disable prebuilt automod rules')
                .addSubcommand(sub =>
                    sub.setName('set')
                        .setDescription('Enable or disable a prebuilt automod rule')
                        .addStringOption(opt =>
                            opt.setName('type')
                                .setDescription('Automod type')
                                .setRequired(true)
                                .addChoices(...automodTypes.map(t => ({ name: t.description, value: t.name })))
                        )
                        .addBooleanOption(opt =>
                            opt.setName('enabled')
                                .setDescription('Enable or disable')
                                .setRequired(true)
                        )
                )
        )
        .addSubcommand(sub =>
            sub.setName('custom')
                .setDescription('Create a custom automod rule')
                .addStringOption(opt =>
                    opt.setName('regex')
                        .setDescription('Regex pattern to block')
                        .setRequired(true)
                )
                .addBooleanOption(opt =>
                    opt.setName('enabled')
                        .setDescription('Enable or disable')
                        .setRequired(true)
                )
        ),
    async execute(interaction) {
        if (interaction.options.getSubcommandGroup(false) === 'preset') {
            const type = interaction.options.getString('type');
            const enabled = interaction.options.getBoolean('enabled');
            automodSettings[type] = enabled;
            await interaction.reply({ content: `Automod rule **${type}** is now **${enabled ? 'enabled' : 'disabled'}**.`, flags: 64 });
        } else if (interaction.options.getSubcommand(false) === 'custom') {
            const regex = interaction.options.getString('regex');
            const enabled = interaction.options.getBoolean('enabled');
            automodSettings['custom'] = { regex, enabled };
            await interaction.reply({ content: `Custom automod rule \`${regex}\` is now **${enabled ? 'enabled' : 'disabled'}**.`, flags: 64 });
        }
    },
    async onMessageCreate(message) {
        if (!message.guild || message.author.bot) return;

        async function logAutomod(action) {
            const logChannelId = getLogChannelId();
            if (logChannelId) {
                const logChannel = message.guild.channels.cache.get(logChannelId);
                if (logChannel) {
                    await logChannel.send({ content: action });
                }
            }
        }

        if (automodSettings['anti-link'] && /(https?:\/\/[^\s]+)/gi.test(message.content)) {
            await message.delete().catch(() => {});
            await message.channel.send({ content: `🚫 <@${message.author.id}>, links are not allowed!`, flags: 64 }).catch(() => {});
            await logAutomod(`🚫 **Anti-Link:** Message from <@${message.author.id}> deleted in <#${message.channel.id}>.`);
        }
        if (automodSettings['anti-invite'] && /(discord\.gg\/|discord\.com\/invite\/)/gi.test(message.content)) {
            await message.delete().catch(() => {});
            await message.channel.send({ content: `🚫 <@${message.author.id}>, Discord invites are not allowed!`, flags: 64 }).catch(() => {});
            await logAutomod(`🚫 **Anti-Invite:** Message from <@${message.author.id}> deleted in <#${message.channel.id}>.`);
        }
        if (automodSettings['anti-caps'] && message.content.length > 10) {
            const caps = message.content.replace(/[^A-Z]/g, '').length;
            if (caps / message.content.length > 0.7) {
                await message.delete().catch(() => {});
                await message.channel.send({ content: `🚫 <@${message.author.id}>, too many capital letters!`, flags: 64 }).catch(() => {});
                await logAutomod(`🚫 **Anti-Caps:** Message from <@${message.author.id}> deleted in <#${message.channel.id}>.`);
            }
        }
        if (automodSettings['anti-emoji']) {
            const emojiCount = (message.content.match(/<a?:\w+:\d+>|[\u{1F600}-\u{1F64F}]/gu) || []).length;
            if (emojiCount > 5) {
                await message.delete().catch(() => {});
                await message.channel.send({ content: `🚫 <@${message.author.id}>, too many emojis!`, flags: 64 }).catch(() => {});
                await logAutomod(`🚫 **Anti-Emoji:** Message from <@${message.author.id}> deleted in <#${message.channel.id}>.`);
            }
        }
        if (automodSettings['anti-mention'] && message.mentions.users.size > 3) {
            await message.delete().catch(() => {});
            await message.channel.send({ content: `🚫 <@${message.author.id}>, too many mentions!`, flags: 64 }).catch(() => {});
            await logAutomod(`🚫 **Anti-Mention:** Message from <@${message.author.id}> deleted in <#${message.channel.id}>.`);
        }
        if (automodSettings['anti-spam']) {
            if (!message.guild._lastMessages) message.guild._lastMessages = {};
            const last = message.guild._lastMessages[message.author.id];
            if (last && last.content === message.content && Date.now() - last.time < 5000) {
                await message.delete().catch(() => {});
                await message.channel.send({ content: `🚫 <@${message.author.id}>, please do not spam!`, flags: 64 }).catch(() => {});
                await logAutomod(`🚫 **Anti-Spam:** Message from <@${message.author.id}> deleted in <#${message.channel.id}>.`);
            }
            message.guild._lastMessages[message.author.id] = { content: message.content, time: Date.now() };
        }
        if (automodSettings['custom'] && automodSettings['custom'].enabled) {
            const regex = new RegExp(automodSettings['custom'].regex, 'gi');
            if (regex.test(message.content)) {
                await message.delete().catch(() => {});
                await message.channel.send({ content: `🚫 <@${message.author.id}>, your message was blocked by a custom rule!`, flags: 64 }).catch(() => {});
                await logAutomod(`🚫 **Custom Rule:** Message from <@${message.author.id}> deleted in <#${message.channel.id}>. Pattern: \`${automodSettings['custom'].regex}\``);
            }
        }
    }
};