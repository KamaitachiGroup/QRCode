import { Command } from './command';
import { CacheType, Client, Interaction } from 'discord.js';
import { REST } from '@discordjs/rest';
import {  Routes } from 'discord-api-types/v10';

export class CommandManager {
  private client: Client;
  private rest: REST;

  constructor (client: Client) {
    this.client = client;
    this.rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);
    this.client.on('interactionCreate', this.onInteractionCreate.bind(this));

  }

  private commands: Command[] = [];

  public addCommand(command: Command): void {
    if (this.commands.findIndex((e) => e.getName() === command.getName()) !== -1) {
      throw new Error(`Command "${command.getName()}" already exists`);
    }
    this.commands.push(command);
  }

  public getCommands(): Command[] {
    return this.commands;
  }

  private async onInteractionCreate(interaction: Interaction<CacheType>): Promise<void> {
    if (! interaction.isCommand()) {
      return;
    }

    const command = this.commands.find((e) => e.getName() === interaction.commandName);

    if (! command) {
      return;
    }

    return command.execute(interaction, this.client);
  }

  public async registerCommands(): Promise<void> {
    const commands = [];

    for (const command of this.commands) {
      commands.push(command.build().toJSON());
    }

    await this.rest.put(Routes.applicationCommands(this.client.application?.id!), { body: commands });
  }
}