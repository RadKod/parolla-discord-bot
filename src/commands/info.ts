import {SlashCommandBuilder} from "discord.js";
import {SlashCommand} from "../../types.js";
import {getQuestions} from "../services/questions.js";

const command: SlashCommand = {
    command: new SlashCommandBuilder().setName('parolla').setDescription('Replies with Parolla!'),
    execute: async (interaction) => {
        await interaction.reply('Parolla!');
    }
}
export default command;
