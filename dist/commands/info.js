import { SlashCommandBuilder } from "discord.js";
const command = {
    command: new SlashCommandBuilder().setName('parolla').setDescription('Replies with Parolla!'),
    execute: async (interaction) => {
        await interaction.reply('Parolla!');
    }
};
export default command;
//# sourceMappingURL=info.js.map