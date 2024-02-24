const fs = require("node:fs");
const path = require("node:path");
const wait = require("node:timers/promises").setTimeout;
const Canvas = require("@napi-rs/canvas");

const { GlobalFonts } = require("@napi-rs/canvas");
GlobalFonts.registerFromPath(
  path.join(__dirname, "src", "fonts", "Poppins-Light.ttf"),
  "Poppins Light"
);
GlobalFonts.registerFromPath(
  path.join(__dirname, "src", "fonts", "Poppins-Medium.ttf"),
  "Poppins Medium"
);

const { ticketsMessages, lorem, errorInteraction } = require("./messages.json");
const getRoles = require("./rangos.json");

//Iniciacion de permisos y requerimientos del bot
const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
  StringSelectMenuBuilder,
  ActionRow,
  ChannelType,
  AttachmentBuilder,
} = require("discord.js");
const { token } = require("./config.json");
const { log } = require("node:console");

//Inicios del bot y limites
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, async (bot) => {
  console.log(`${bot.user.tag} se encuentra listo!`);
  client.user.setPresence({
    activities: [{ name: "co.ivao.aero" }],
    status: "online",
  });
});

client.on(Events.InteractionCreate, async (interaction) => {
  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: errorInteraction,
      ephemeral: true,
    });
  }
});

// Funcion de los tickets

client.on(Events.InteractionCreate, async (interaction) => {
  var guild = interaction.guild;
  const randomValue = Math.floor(Math.random() * 9000) + 1000;
  const roles = Array.from(guild.roles.cache.values());

  async function createChannelTicket(department, roleDepartament) {
    let responseCreateEmbed = new EmbedBuilder()
      .setColor("Random")
      .setAuthor({
        name: "IVAO Colombia Tickets",
        iconURL: client.user.avatarURL(),
      })
      .setURL("https://co.ivao.aero")
      .setDescription(
        `
      **Departamento:** ${department} 
      **Usuario:** ${interaction.member.nickname} 
      ${ticketsMessages.descriptionResponseTicket}
    `
      )
      .setFooter({ text: "Puede cerrar el ticket dandole al boton" });

    let closeResponseButton = new ButtonBuilder()
      .setCustomId("closeTicket")
      .setStyle(ButtonStyle.Danger)
      .setLabel("❌ Cerrar");

    let responseRowBuilder = new ActionRowBuilder().addComponents(
      closeResponseButton
    );

    let staffRole = guild.roles.cache.get("1077610256844193878");
    channelTicket = await guild.channels
      .create({
        name: `ticket ${randomValue}`,
        parent: "1077610261818658893",
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: guild.roles.everyone,
            deny: ["ViewChannel"],
          },
          {
            id: interaction.user.id,
            allow: [
              "ViewChannel",
              "SendMessages",
              "AddReactions",
              "ReadMessageHistory",
            ],
          },
          {
            id: staffRole,
            allow: ["ViewChannel", "AddReactions", "ReadMessageHistory"],
            deny: ["SendMessages"],
          },
          {
            id: roleDepartament,
            allow: [
              "ViewChannel",
              "SendMessages",
              "AddReactions",
              "ReadMessageHistory",
            ],
          },
        ],
      })
      .then((channelTicket) => {
        channelTicket.send({
          embeds: [responseCreateEmbed],
          components: [responseRowBuilder],
        }),
          interaction.reply({
            content: `Su ticket se ha creado exitosamente ✅ ${channelTicket}`,
            ephemeral: true,
          });
      });
  }

  // El StringSelector son las posible selecciones del usuario
  var firstSelect = new StringSelectMenuBuilder({
    custom_id: "selectProblem",
    placeholder: "Seleccione su problema",
    max_values: 1,
    options: [
      {
        label: "Departamento de Eventos",
        value: "eventos",
        description:
          ticketsMessages.deployDescriptionSelection.eventsDescription,
      },
      {
        label: "Departamento de Entrenamiento / Examenes",
        value: "entrenamiento",
        description:
          ticketsMessages.deployDescriptionSelection.TrainingDescription,
      },
      {
        label: "Informe / Reporte de Miembros",
        value: "miembros",
        description:
          ticketsMessages.deployDescriptionSelection.MemebershipDescription,
      },
      {
        label: "Operaciones (Militares, ATC y Vuelo)",
        value: "operaciones",
        description:
          ticketsMessages.deployDescriptionSelection.operationDescription,
      },
      {
        label: "Relaciones Publicas",
        value: "relaciones publicas",
        description:
          ticketsMessages.deployDescriptionSelection.publicRelationsDescription,
      },
      {
        label: "Departamento web",
        value: "web",
        description: ticketsMessages.deployDescriptionSelection.webDescription,
      },
      {
        label: "FIR(s) team",
        value: "fir",
        description: ticketsMessages.deployDescriptionSelection.firDescription,
      },
    ],
  });

  // Lo convertimos a una fila
  let firstRow = new ActionRowBuilder().addComponents(firstSelect);

  // Instalamos y ejecutamos los tickets

  if (interaction.commandName == "install-tickets") {
    var supportChannel = interaction.options.getChannel("canal");
    let ticketCreateEmbed = new EmbedBuilder()
      .setColor("Random")
      .setAuthor({
        name: "IVAO Colombia Tickets",
        iconURL: client.user.avatarURL(),
      })
      .setURL("https://co.ivao.aero")
      .setDescription(ticketsMessages.descriptionTicket)
      .setTimestamp();

    supportChannel.send({
      embeds: [ticketCreateEmbed],
      components: [firstRow],
    });
    await interaction.reply({ content: "Todo fue instalado correctamente!" });
  }

  if (interaction.customId == "selectProblem") {
    let choices = "";

    await interaction.values.forEach((value) => {
      choices += `${value}`;
    });

    switch (choices) {
      case "eventos":
        createChannelTicket("Eventos / Tours", getRoles[24].id);
        break;
      case "entrenamiento":
        createChannelTicket("Entrenamiento / Examenes", getRoles[36].id);
        break;
      case "miembros":
        createChannelTicket("Informe / Reporte de Miembros", getRoles[37].id);
        break;
      case "operaciones": // No funciona al 100% (toca crear un unico rango para OP)
        createChannelTicket(
          "Operaciones (Militares, ATC y Vuelo)",
          getRoles[10].id
        );
        break;
      case "relaciones publicas":
        createChannelTicket("Relaciones Publicas", getRoles[30].id);
        break;
      case "web":
        createChannelTicket("Departamento web", getRoles[18].id);
        break;
      case "fir":
        createChannelTicket("Fir", getRoles[6].id);
        break;
      default:
        interaction.reply({
          content: "Interaccion invalida! 📛",
          ephemeral: true,
        });
        break;
    }
  }

  if (interaction.customId == "closeTicket") {
    let ticketChannelEnd = interaction.guild.channels.cache.get(
      interaction.channelId
    );

    interaction.channel.send("Conversacion Cerrada... ¡Tenga un gran día!");
    await wait(1500);
    ticketChannelEnd
      .delete()
      .then((deleteChannel) => {
        interaction.user.send(ticketsMessages.lastMessage);
      })
      .catch(console.error);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.commandName == "new-training") {
    let airport = interaction.options.getString("dependencia");
    let time = interaction.options.getString("hora");
    let date = interaction.options.getString("fecha");

    try {
      const canvas = Canvas.createCanvas(1920, 1200);
      const context = canvas.getContext("2d");
      const background = await Canvas.loadImage(
        "./src/img/EntrenamientosATC.png"
      );

      context.drawImage(background, 0, 0, canvas.width, canvas.height);
      context.font = "54px Poppins Medium";
      context.fillStyle = "#ffffff";

      context.fillText(airport, canvas.width / 5, 650);
      context.fillText(date, canvas.width / 5, 800);
      context.fillText(time, canvas.width / 5, 950);

      const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), {
        name: `anuncio-${airport}-${date}-${time}.png`,
      });

      await interaction.reply({
        content: `**Aeropuerto:** ${airport}\n **Hora:** ${time}\n **Fecha:** ${date}\n **Requerido por:** <@${interaction.user.id}>`,
        files: [attachment],
      });
    } catch (error) {
      console.log(error);
      await interaction.reply({
        content: "Se ha producido un error!. Contacta a WM",
        ephemeral: true,
      });
    }
  }
});

client.login(token);
