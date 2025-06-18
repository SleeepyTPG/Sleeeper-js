const { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isButton() && !interaction.isModalSubmit()) return;
        if (!interaction.client.embedDrafts) interaction.client.embedDrafts = {};
        const embed = interaction.client.embedDrafts[interaction.user.id];
        if (!embed) return;

        if (interaction.isButton()) {
            if (interaction.customId === 'eb_title' || interaction.customId === 'eb_desc' || interaction.customId === 'eb_color') {
                const modal = new ModalBuilder()
                    .setCustomId(`eb_modal_${interaction.customId.split('_')[1]}`)
                    .setTitle('Edit Embed');

                let input;
                if (interaction.customId === 'eb_title') {
                    input = new TextInputBuilder()
                        .setCustomId('eb_input_title')
                        .setLabel('Embed Title')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                        .setValue(embed.data.title || '');
                } else if (interaction.customId === 'eb_desc') {
                    input = new TextInputBuilder()
                        .setCustomId('eb_input_desc')
                        .setLabel('Embed Description')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                        .setValue(embed.data.description || '');
                } else if (interaction.customId === 'eb_color') {
                    input = new TextInputBuilder()
                        .setCustomId('eb_input_color')
                        .setLabel('Embed Color (hex, e.g. #5865F2)')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                        .setValue(`#${(embed.data.color || 0x5865F2).toString(16).padStart(6, '0')}`);
                }

                modal.addComponents(new ActionRowBuilder().addComponents(input));
                return interaction.showModal(modal);
            }

            if (interaction.customId === 'eb_send') {
                await interaction.reply({ content: 'Where should I send the embed? Mention a channel or type "here".', ephemeral: true });
                const filter = m => m.author.id === interaction.user.id;
                const msg = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000 }).catch(() => null);
                if (!msg || !msg.first()) return interaction.followUp({ content: '❌ No channel specified. Cancelled.', ephemeral: true });

                let channel = null;
                if (msg.first().content.toLowerCase() === 'here') {
                    channel = interaction.channel;
                } else {
                    const match = msg.first().mentions.channels.first();
                    if (match) channel = match;
                }
                if (!channel) return interaction.followUp({ content: '❌ Invalid channel. Cancelled.', ephemeral: true });

                await channel.send({ embeds: [embed] });
                await interaction.followUp({ content: '✅ Embed sent!', ephemeral: true });
                delete interaction.client.embedDrafts[interaction.user.id];
            }
        }

        if (interaction.isModalSubmit()) {
            if (interaction.customId === 'eb_modal_title') {
                embed.setTitle(interaction.fields.getTextInputValue('eb_input_title'));
            } else if (interaction.customId === 'eb_modal_desc') {
                embed.setDescription(interaction.fields.getTextInputValue('eb_input_desc'));
            } else if (interaction.customId === 'eb_modal_color') {
                let color = interaction.fields.getTextInputValue('eb_input_color').replace('#', '');
                if (!/^([0-9A-F]{6})$/i.test(color)) color = '5865F2';
                embed.setColor(parseInt(color, 16));
            }

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('eb_title').setLabel('Set Title').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('eb_desc').setLabel('Set Description').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('eb_color').setLabel('Set Color').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('eb_send').setLabel('Send Embed').setStyle(ButtonStyle.Success)
            );
            await interaction.update({ embeds: [embed], components: [row], ephemeral: true });
        }
    }
};