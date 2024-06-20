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
const getImages = require("./images.json");
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
  StringSelectMenuBuilder,
  ChannelType,
  AttachmentBuilder,
  ActivityType,
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
    status: "dnd",
  });
  client.user.setActivity("Mantenimiento", {
    type: ActivityType.Watching,
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
      .setColor("#0D2C99")
      .setAuthor({
        name: "IVAO Colombia Tickets",
        iconURL: client.user.avatarURL(),
      })
      .setURL("https://co.ivao.aero")

      .setFooter({ text: "Puede cerrar el ticket dandole al boton" });

    if (roleDepartament == getRoles[18].id) {
      responseCreateEmbed.setDescription(
        `
        **RECUERDE**: No aceptamos reclamos por (MTL - AURORA - ALTITUDE)
        **Departamento:** ${department} 
      **Usuario:** ${interaction.member.nickname} 
      ${ticketsMessages.descriptionResponseTicket}
        `
      );
    } else {
      responseCreateEmbed.setDescription(
        `
      **Departamento:** ${department} 
      **Usuario:** ${interaction.member.nickname} 
      ${ticketsMessages.descriptionResponseTicket}
      `
      );
    }
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
        parent: "1077610259197218926",
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
        });
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
      {
        label: "Hq divisional",
        value: "hq",
        description: ticketsMessages.deployDescriptionSelection.hqDescription,
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
      case "hq":
        createChannelTicket("Hq Divisional", getRoles[25].id);
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

async function createAdvertisement(type, airport, date, time) {
  let route;
  let files = [];
  // Define the route if is for training or exam
  switch (type) {
    case "training":
      route = "src/img/training/";
      break;
    case "exam":
      route = "src/img/exam/";
      break;
  }

  // Search images in folder by extension (.png)
  const imagePath = path.join(__dirname, route);
  const commandFiles = fs
    .readdirSync(imagePath)
    .filter((file) => file.endsWith(".png"));
  // Create images for each of the files found
  for (const file of commandFiles) {
    let imageConfig;
    const filePath = path.join(imagePath, file);
    //Json to array
    let imageArray = Array.from(Object.values(getImages));

    for (const image of imageArray) {
      if (image.file == file) {
        imageConfig = image;
      }
    }
    const background = await Canvas.loadImage(filePath);
    const canvas = Canvas.createCanvas(background.width, background.height);
    const context = canvas.getContext("2d");
    context.drawImage(background, 0, 0, canvas.width, canvas.height);
    context.font = `${imageConfig.font}px Poppins Medium`;
    context.fillStyle = "#ffffff";
    context.fillText(airport, imageConfig.xCoord, imageConfig.aCoord);
    context.fillText(date, imageConfig.xCoord, imageConfig.dCoord);
    context.fillText(time, imageConfig.xCoord, imageConfig.tCoord);

    const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), {
      name: `anuncio-${airport}-${date}-${time}-${imageConfig.name}.png`,
    });
    files.push(attachment);
  }

  return files;
}

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.commandName == "new-training") {
    if (!interaction.member.roles.cache.has("1077610256890351656")) {
      return interaction.reply({
        content: "You don't have permissions!",
        ephemeral: true,
      });
    }

    let airport = interaction.options.getString("dependencia");
    let time = interaction.options.getString("hora");
    let date = interaction.options.getString("fecha");

    try {
      let images = createAdvertisement("training", airport, date, time);

      await images.then(function (result) {
        interaction.reply({
          content: `**Aeropuerto:** ${airport}\n **Hora:** ${time}\n **Fecha:** ${date}\n **Requerido por:** <@${interaction.user.id}>`,
          files: result,
        });
      });
    } catch (error) {
      console.log(error);
      await interaction.reply({
        content: "Se ha producido un error!. Contacta a WM",
        ephemeral: true,
      });
    }
  }
  if (interaction.commandName == "new-exam") {
    if (!interaction.member.roles.cache.has("1077610256890351656")) {
      return interaction.reply({
        content: "You don't have permissions!",
        ephemeral: true,
      });
    }
    let airport = interaction.options.getString("dependencia");
    let time = interaction.options.getString("hora");
    let date = interaction.options.getString("fecha");

    try {
      let images = createAdvertisement("exam", airport, date, time);

      await images.then(function (result) {
        interaction.reply({
          content: `**Aeropuerto:** ${airport}\n **Hora:** ${time}\n **Fecha:** ${date}\n **Requerido por:** <@${interaction.user.id}>`,
          files: result,
        });
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
