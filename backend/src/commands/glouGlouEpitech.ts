import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Client, GuildMember } from 'discord.js';
import { Command } from '../core/commands/command';
import moment = require('moment');

export class GlouGlouEpitechCommand extends Command {
  private championNames: Array<string> = [];

  constructor() {
    super('glouglouepitech');
  }

  protected buildCommand(commandBuilder: SlashCommandBuilder): void {
    commandBuilder
      .setDescription('Glou Glou Epitech : retrieve the remaining time before the end of Epitech')
  }

  public async execute(interaction: CommandInteraction, client: Client): Promise<void> {
    const now = moment()
    const end = moment('07-28-2023 17:30', 'MM-DD-YYYY hh:mm')
    const mscStart = moment('10-24-2021 9:30', 'MM-DD-YYYY hh:mm')
    const msc2Start = moment('09-01-2022 9:30', 'MM-DD-YYYY hh:mm')
    const duration = moment.duration(end.diff(now))
    const mscDiff = mscStart.diff(now)
    const msc2Diff = msc2Start.diff(now)

    let content = `GlouGlou Epitech !\n`;
    content += `Temps restant : ${duration.months()} mois, ${duration.days()} jours, ${duration.hours()} h, ${duration.minutes()} m, ${duration.seconds()} s\n`
    content += `Jours restants : ${end.diff(now, 'days')}\n`
    content += `% MSC : ${((mscDiff / mscStart.diff(end)) * 100).toFixed(2)}%\n`
    content += `% MSC2 : ${((msc2Diff / msc2Start.diff(end)) * 100).toFixed(2)}%\n`

    await interaction.reply(content);
  } 
}
