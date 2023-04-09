import {
    ActionRowBuilder,
    Client, CollectedInteraction, Collection, EmbedBuilder,
    Events,
    GatewayIntentBits, InteractionCollector,
    Partials, REST, Routes, SelectMenuBuilder
} from "discord.js";
import {SlashCommand} from "../types.js";
import info from "./commands/info.js";
import {getQuestions} from "./services/questions.js";
import turkishToEnglish from "./utils/turkishToEnglish.js";

import dotenv from "dotenv";
dotenv.config();

const DISCORD_SECRET = process.env.DISCORD_SECRET;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;


const client: Client | any = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildEmojisAndStickers, GatewayIntentBits.GuildIntegrations, GatewayIntentBits.GuildWebhooks, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.DirectMessageTyping, GatewayIntentBits.MessageContent],
    shards: "auto",
    partials: [Partials.Message, Partials.Channel, Partials.GuildMember, Partials.Reaction, Partials.GuildScheduledEvent, Partials.User, Partials.ThreadMember]
});


const baslangic = new EmbedBuilder({
    title: "Parolla",
    description: "Parolla oyununa hosgeldin! Oyunu baslatmak icin mod secin.",
    color: 0x00FFFF,
})

const components = [
    new ActionRowBuilder().addComponents(
        [
            new SelectMenuBuilder().setCustomId("mode").setPlaceholder("Oyun Modu").addOptions(
                [{
                    label: "Rekabetçi (Günlük)",
                    value: "0",
                }, {
                    label: "Limitsiz",
                    value: "1",
                }]
            ),
        ]
    )
]

const collector = new InteractionCollector(client)

client.slashCommands = new Collection<string, SlashCommand>();

client.slashCommands.set(info.command.name, info)

client.games = new Collection<string, any>();

const rest = new REST({version: '10'}).setToken(DISCORD_SECRET);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            {body: client.slashCommands.map(command => command.command.toJSON())},
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

client.once('ready', (client: Client) => {
    console.log("Bot baslatildi!");
    client.user.setActivity({
        name: "Hayalleriyle",
        type: 0,
        url: "https://parolla.app"
    })
});
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);

    if (!command) return;

    // if(interaction.user.id === "592778527900827658"){
    //     await interaction.reply("1+1=");
    //     return;
    // }

    console.log(interaction)
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
    }
});


client.on(Events.MessageCreate, async message => {

    if (message.content === '!b') {
        message.reply({
            embeds: [baslangic],
            components: components,
        })
    }

    if (message.content.startsWith("!c")) {
        const game = client.games.get(message.author.id)
        const answer = message.content.split(" ")[1];
        if (!game) {
            message.delete();
            await message.author.send({
                content: "Oyununuz yok! Adam akilli dur aklini alirim.",
            })
            return;
        }

        if (game) {
            if (String(turkishToEnglish(game.questions[game.question].answer)).toLowerCase().split(", ").includes(turkishToEnglish(answer.toLowerCase()))) {
                game.correct += 1;
                game.question += 1;
                clearInterval(game.interval);
                game.interval = setInterval(async () => {
                    game.time -= 1;

                    if (game.time < 0) {
                        clearInterval(game.interval);
                        game.finished = true;
                        game.message.edit({
                            content: `Oyun bitti! D: ${game.correct} dogru, ${game.wrong} yanlis cevap verdiniz!`,
                        });
                        client.games.delete(message.author.id);
                        return;
                    }

                    await game.message.edit({
                        content: `Oyuncu: <@${message.author.id}>\nKalan süre: ${game.time} \nDogru cevap!\nDoğru: ${game.correct}   Yanlış: ${game.wrong} \nHarf: ${game.questions[game.question].letter}\nSoru: ${game.questions[game.question].question}`,
                    });


                }, 1000)
                game.message = await message.channel.send({
                    content: `Oyuncu: <@${message.author.id}>\nKalan süre: ${game.time} \nDogru cevap!\nDoğru: ${game.correct}   Yanlış: ${game.wrong} \nHarf: ${game.questions[game.question].letter}\nSoru: ${game.questions[game.question].question}`,
                })
                await message.delete();
            } else {
                game.wrong += 1;
                game.question += 1;
                clearInterval(game.interval);
                game.interval = setInterval(async () => {
                    game.time -= 1;

                    if (game.time < 0) {
                        clearInterval(game.interval);
                        game.finished = true;
                        game.message.edit({
                            content: `Oyun bitti! D: ${game.correct} dogru, ${game.wrong} yanlis cevap verdiniz!`,
                        });
                        client.games.delete(message.author.id);
                        return;
                    }

                    await game.message.edit({
                        content: `Oyuncu: <@${message.author.id}>\nKalan süre: ${game.time} \nDogru cevap!\nDoğru: ${game.correct}   Yanlış: ${game.wrong} \nHarf: ${game.questions[game.question].letter}\nSoru: ${game.questions[game.question].question}`,
                    });

                }, 1000)
                game.message = await message.channel.send({
                    content: `Oyuncu: <@${message.author.id}>\nKalan süre: ${game.time} \nDogru cevap!\nDoğru: ${game.correct}   Yanlış: ${game.wrong} \nHarf: ${game.questions[game.question].letter}\nSoru: ${game.questions[game.question].question}`,
                });
            }
        }

    }
});
collector.on('collect', async (interaction: CollectedInteraction | any) => {
    if (interaction.customId === "mode") {
        if (client.games.has(interaction.user.id)) {
            await interaction.reply({
                content: "Zaten bir oyununuz var!",
                ephemeral: true,
            })
            return;
        }

        await interaction.message.delete();
        const questions = await getQuestions({mode: interaction.values[0]});
        let message = await interaction.channel.send({
            content: `Oyun baslatiliyor...\nOyuncu: <@${interaction.user.id}>\nHarf: ${questions.data.questions[0].letter}\nSoru: ${questions.data.questions[0].question}`,
        })
        client.games.set(interaction.user.id, {
            message: message,
            mode: interaction.values[0],
            correct: 0,
            wrong: 0,
            question: 0,
            questions: questions.data.questions,
            started: false,
            finished: false,
            time: 300,
        })
    }
});

client.login(DISCORD_SECRET);
