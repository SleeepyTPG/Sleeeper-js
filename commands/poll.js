const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Create a fancy poll with up to 5 options and live results')
        .addStringOption(opt => opt.setName('question').setDescription('The poll question').setRequired(true))
        .addStringOption(opt => opt.setName('option1').setDescription('Option 1').setRequired(true))
        .addStringOption(opt => opt.setName('option2').setDescription('Option 2').setRequired(true))
        .addStringOption(opt => opt.setName('option3').setDescription('Option 3').setRequired(false))
        .addStringOption(opt => opt.setName('option4').setDescription('Option 4').setRequired(false))
        .addStringOption(opt => opt.setName('option5').setDescription('Option 5').setRequired(false))
        .addIntegerOption(opt =>
            opt.setName('minutes')
                .setDescription('Poll duration in minutes (optional)')
                .setMinValue(1)
                .setMaxValue(4320)
                .setRequired(false)
        )
        .addIntegerOption(opt =>
            opt.setName('hours')
                .setDescription('Poll duration in hours (optional)')
                .setMinValue(1)
                .setMaxValue(72)
                .setRequired(false)
        )
        .addIntegerOption(opt =>
            opt.setName('days')
                .setDescription('Poll duration in days (max: 3)')
                .setMinValue(1)
                .setMaxValue(3)
                .setRequired(false)
        ),
    async execute(interaction) {
        const question = interaction.options.getString('question');
        const options = [
            interaction.options.getString('option1'),
            interaction.options.getString('option2'),
            interaction.options.getString('option3'),
            interaction.options.getString('option4'),
            interaction.options.getString('option5')
        ].filter(Boolean);

        if (options.length < 2) {
            return interaction.reply({ content: 'You must provide at least 2 options!', ephemeral: true });
        }

        let minutes = interaction.options.getInteger('minutes') || 0;
        let hours = interaction.options.getInteger('hours') || 0;
        let days = interaction.options.getInteger('days') || 0;

        let totalMinutes = (days * 24 * 60) + (hours * 60) + minutes;
        if (totalMinutes === 0) totalMinutes = 60;
        if (totalMinutes > 4320) totalMinutes = 4320;

        const durationMs = totalMinutes * 60 * 1000;
        const endTime = Date.now() + durationMs;

        const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
        const votes = Array(options.length).fill(0);
        const voters = new Map();

        const getResults = () =>
            options.map((opt, i) => `${emojis[i]} **${opt}**\n> Votes: \`${votes[i]}\``).join('\n\n');

        const embed = new EmbedBuilder()
            .setTitle('📊 New Poll')
            .setDescription(`**${question}**\n\n${getResults()}\n\n⏰ Ends: <t:${Math.floor(endTime / 1000)}:R>`)
            .setColor(0x5865F2)
            .setFooter({ text: `Poll by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            ...options.map((opt, i) =>
                new ButtonBuilder()
                    .setCustomId(`poll_option_${i}`)
                    .setLabel(opt.length > 20 ? opt.slice(0, 17) + '...' : opt)
                    .setEmoji(emojis[i])
                    .setStyle(ButtonStyle.Primary)
            )
        );

        const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

        const collector = msg.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: durationMs
        });

        collector.on('collect', async i => {
            if (i.user.bot) return;
            const userId = i.user.id;
            const chosen = parseInt(i.customId.replace('poll_option_', ''), 10);

            if (voters.has(userId)) {
                const prev = voters.get(userId);
                if (prev !== chosen) votes[prev]--;
            }

            voters.set(userId, chosen);
            votes[chosen]++;

            embed.setDescription(`**${question}**\n\n${getResults()}\n\n⏰ Ends: <t:${Math.floor(endTime / 1000)}:R>`);
            await i.update({ embeds: [embed], components: [row] });
        });

        collector.on('end', async () => {
            row.components.forEach(btn => btn.setDisabled(true));
            embed.setColor(0x2ECC71)
                .setTitle('📊 Poll Ended')
                .setDescription(`**${question}**\n\n${getResults()}\n\n*Poll closed*`);
            await msg.edit({ embeds: [embed], components: [row] });
        });
    }
};