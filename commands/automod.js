const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('automod')
        .setDescription('Manage Discord\'s built-in AutoMod rules')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(sub =>
            sub.setName('block_links')
                .setDescription('Create or enable a built-in AutoMod rule to block links')
        )
        .addSubcommand(sub =>
            sub.setName('block_invites')
                .setDescription('Create or enable a built-in AutoMod rule to block Discord invites')
        )
        .addSubcommand(sub =>
            sub.setName('block_words')
                .setDescription('Block specific words/phrases')
                .addStringOption(opt =>
                    opt.setName('words')
                        .setDescription('Comma-separated list of words/phrases to block')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('List all active AutoMod rules')
        )
        .addSubcommand(sub =>
            sub.setName('delete')
                .setDescription('Delete a built-in AutoMod rule by name')
                .addStringOption(opt =>
                    opt.setName('name')
                        .setDescription('Name of the rule to delete')
                        .setRequired(true)
                )
        ),
    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        if (sub === 'block_links') {
            const rules = await interaction.guild.autoModerationRules.fetch();
            if (rules.some(rule => rule.name === 'Block Links')) {
                return interaction.reply({ content: '✅ AutoMod rule **Block Links** already exists!', flags: 64 });
            }
            await interaction.guild.autoModerationRules.create({
                name: 'Block Links',
                creatorId: interaction.client.user.id,
                eventType: 1,
                triggerType: 1,
                triggerMetadata: {
                    keywordFilter: ['http://', 'https://']
                },
                actions: [
                    { type: 1, metadata: {} }
                ],
                enabled: true,
                exemptRoles: [],
                exemptChannels: []
            });
            return interaction.reply({ content: '🛡️ AutoMod rule **Block Links** has been created and enabled!', flags: 64 });
        }

        if (sub === 'block_invites') {
            const rules = await interaction.guild.autoModerationRules.fetch();
            if (rules.some(rule => rule.name === 'Block Invites')) {
                return interaction.reply({ content: '✅ AutoMod rule **Block Invites** already exists!', flags: 64 });
            }
            await interaction.guild.autoModerationRules.create({
                name: 'Block Invites',
                creatorId: interaction.client.user.id,
                eventType: 1,
                triggerType: 1,
                triggerMetadata: {
                    keywordFilter: ['discord.gg/', 'discord.com/invite/']
                },
                actions: [
                    { type: 1, metadata: {} }
                ],
                enabled: true,
                exemptRoles: [],
                exemptChannels: []
            });
            return interaction.reply({ content: '🛡️ AutoMod rule **Block Invites** has been created and enabled!', flags: 64 });
        }

        if (sub === 'block_words') {
            const words = interaction.options.getString('words').split(',').map(w => w.trim()).filter(Boolean);
            if (!words.length) {
                return interaction.reply({ content: '❌ Please provide at least one word or phrase.', flags: 64 });
            }
            const ruleName = `Block Words (${words.slice(0, 3).join(', ')}${words.length > 3 ? ', ...' : ''})`;
            const rules = await interaction.guild.autoModerationRules.fetch();
            if (rules.some(rule => rule.name === ruleName)) {
                return interaction.reply({ content: `✅ AutoMod rule **${ruleName}** already exists!`, flags: 64 });
            }
            await interaction.guild.autoModerationRules.create({
                name: ruleName,
                creatorId: interaction.client.user.id,
                eventType: 1,
                triggerType: 1,
                triggerMetadata: {
                    keywordFilter: words
                },
                actions: [
                    { type: 1, metadata: {} }
                ],
                enabled: true,
                exemptRoles: [],
                exemptChannels: []
            });
            return interaction.reply({ content: `🛡️ AutoMod rule **${ruleName}** has been created and enabled!`, flags: 64 });
        }

        if (sub === 'list') {
            const rules = await interaction.guild.autoModerationRules.fetch();
            if (!rules.size) {
                return interaction.reply({ content: 'No AutoMod rules found for this server.', flags: 64 });
            }
            const desc = Array.from(rules.values())
                .map(rule => `• **${rule.name}** — ${rule.enabled ? '🟢 Enabled' : '🔴 Disabled'}`)
                .join('\n');
            return interaction.reply({ content: `**Active AutoMod Rules:**\n${desc}`, flags: 64 });
        }

        if (sub === 'delete') {
            const name = interaction.options.getString('name');
            const rules = await interaction.guild.autoModerationRules.fetch();
            const rule = rules.find(r => r.name === name);
            if (!rule) {
                return interaction.reply({ content: `❌ No AutoMod rule found with the name **${name}**.`, flags: 64 });
            }
            await rule.delete();
            return interaction.reply({ content: `🗑️ AutoMod rule **${name}** has been deleted.`, flags: 64 });
        }
    }
};