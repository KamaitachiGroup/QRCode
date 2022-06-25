import { SlashCommandBuilder } from '@discordjs/builders';
import {CommandInteraction, Client, GuildMember, Snowflake} from 'discord.js';
import { Command } from '../core/commands/command';

const JSON_CHAMPS_URL: URL = new URL("http://ddragon.leagueoflegends.com/cdn/9.3.1/data/en_US/champion.json");
const LOL_ROLES: Array<string> = [
  "MID",
  "TOP",
  "JUNGLER",
  "ADC",
  "SUPPORT"
]
const MAX_PLAYER: number = 5;

export class LoLPickerCommand extends Command {
  private championNames: Array<string> = [];

  constructor() {
    super('lolpicker');
  }

  protected buildCommand(commandBuilder: SlashCommandBuilder): void {
    commandBuilder
      .setDescription('Pick a random League Of Legend Champions')
      .addChannelOption(option => option.setName("channel").setRequired(true).setDescription("Channel of league of legend players"))
      .addBooleanOption(option => option.setName("withroles").setRequired(false).setDescription("Randomize roles"))
  }

  private async getChampionNames(): Promise<any> {
    if (this.championNames.length > 0)
      return this.championNames;
    try {
      const resp = await fetch(JSON_CHAMPS_URL);
      const json = await resp.json();
      this.championNames = Object.keys(json.data).map((champKey) => json.data[champKey].name);
      return this.championNames;
    } catch (err) {
      throw new Error("Can't collect champions names!")
    }
  }

  private async pickRandomChampion(): Promise<string | undefined> {
    return this.championNames.at(Math.floor(Math.random() * this.championNames.length));
  }

  private async getChannelUserNames(channel: any): Promise<Array<string>> {
    const members = await channel.members;
    return members.map((member: GuildMember) => member.user.username);
  }

  private getRandomRoles(playerCount: number): Array<string> {
    const remainingRoles = [...LOL_ROLES];
    return remainingRoles
      .sort(() => (Math.random() > 0.5) ? 1 : -1) // shuffle
      .slice(0, playerCount) // get number of roles for all players
      .sort(); // sort alphabetically
  }

  public async execute(interaction: CommandInteraction, client: Client): Promise<void> {
    const channel: any = interaction.options.getChannel("channel");
    const withRoles: boolean | null = interaction.options.getBoolean("withroles");

    if (!channel || !channel.isVoice()) {
      await interaction.reply({content: 'Could not find channel', ephemeral: true});
      return;
    }

    const channelUsersNames = await this.getChannelUserNames(channel);
    const playerCount = Math.min(channelUsersNames?.length, MAX_PLAYER);

    if (playerCount === 0) {
      await interaction.reply({content: 'No user in the channel!', ephemeral: true});
      return;
    }

    await this.getChampionNames();

    const randomPlayerRoles = this.getRandomRoles(playerCount);
    let content = "";
    for (let i = 0; i < playerCount; i++) {
      const randomChamp = await this.pickRandomChampion();
      if (withRoles)
        content += `[${randomPlayerRoles.at(i)}] - `;
      content += `${channelUsersNames.at(i)}: ${randomChamp}\n`;
    }
    await interaction.reply({content});
  }
}
