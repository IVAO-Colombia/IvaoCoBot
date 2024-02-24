const {
  PermissionFlagsBits,
  SlashCommandBuilder,
  ChannelType,
} = require("discord.js");
const { commandsDescriptrion, publicRelations } = require("../messages.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("new-training")
    .setDescription(commandsDescriptrion.newTraining)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption((option) =>
      option
        .setName("canal")
        .setDescription(publicRelations.channelDescription)
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addStringOption((Option) =>
      Option.setName("dependencia")
        .setDescription(publicRelations.AirportDescription)
        .setRequired(true)
    )
    .addStringOption((Option) =>
      Option.setName("hora")
        .setDescription(publicRelations.timeDescription)
        .setRequired(true)
    )
    .addStringOption((Option) =>
      Option.setName("fecha")
        .setDescription(publicRelations.DayDescription)
        .setRequired(true)
    ),
  async execute(interaction) {},
};
