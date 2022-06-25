import { SlashCommandBuilder } from '@discordjs/builders';
import { CacheType, Client, CommandInteraction } from 'discord.js';

export abstract class Command {
  private commandBuilder = new SlashCommandBuilder();
  private name: string;

  constructor (name: string) {
    this.name = name;

    this.commandBuilder.setName(name);
  }

  getName(): string {
    return this.name;
  }

  protected abstract buildCommand(commandBuilder: SlashCommandBuilder): void;

  public abstract execute(interaction: CommandInteraction<CacheType>, client: Client): Promise<void>;

  public build(): SlashCommandBuilder {
    this.buildCommand(this.commandBuilder);
    return this.commandBuilder;
  }
}