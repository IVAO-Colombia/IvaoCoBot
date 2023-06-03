const { PermissionFlagsBits ,SlashCommandBuilder, ChannelType } = require('discord.js');
const { commandsDescriptrion } = require('../messages.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('install-tickets')
		.setDescription(commandsDescriptrion.installTickets)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addChannelOption(option =>
			option.setName("canal")
				.setDescription(commandsDescriptrion.installTickets)
				.addChannelTypes(ChannelType.GuildText)
				.setRequired(true)
		),
	async execute(interaction) {
		
	},
};