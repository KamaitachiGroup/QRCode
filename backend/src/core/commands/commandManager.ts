import { Command } from './command';
import { CacheType, Client, CommandInteraction, Interaction, CommandInteractionOption, TextChannel } from 'discord.js';
import { REST } from '@discordjs/rest';
import {  Routes } from 'discord-api-types/v10';
import { Postgres } from '../../services/postgres';

export function serializeCommand(command: CommandInteraction<CacheType>): string {
  const options: string[] = [];
  for (const option of command.options.data) {
    if (option.type === 'USER') {
      options.push(`${option.name}="${option.user!.username}"`);
    } else if (option.type === 'CHANNEL') {
      options.push(`${option.name}="${option.channel!.name}"`);
    } else {
      options.push(`${option.name}="${option.value}"`);
    }
  }

  return `/${command.commandName} ${options.join(' ')}`;
}
export class CommandManager {
  private client: Client;
  private rest: REST;
  private postgres: Postgres;


  constructor (client: Client, postgres: Postgres) {
    this.client = client;
    this.postgres = postgres;
    this.rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);
  }

  async init (): Promise<void> {
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

    const commandInteraction = interaction as CommandInteraction<CacheType>;

    try {
      await this.postgres.query('INSERT INTO messages (guild_id, channel_id, author_id, message_id, guild_name, channel_name, author_name, message, action, is_bot, actor_id, actor_name, is_command) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
      [commandInteraction.guildId, commandInteraction.channelId, commandInteraction.user.id, commandInteraction.id, commandInteraction.guild?.name ?? null, (commandInteraction.channel as TextChannel)?.name, commandInteraction.user.username, serializeCommand(commandInteraction), 'CREATE', commandInteraction.user.bot, commandInteraction.user.id, commandInteraction.user.username, true ]);
    } catch (e) {
      console.error(e);
    }

    const command = this.commands.find((e) => e.getName() === commandInteraction.commandName);

    if (! command) {
      return;
    }

    try {
      await command.execute(commandInteraction, this.client);
    } catch (e) {
      console.error(e);
    }
  }

  public async registerCommands(): Promise<void> {
    const commands = [];

    for (const command of this.commands) {
      commands.push(command.build().toJSON());
    }

    await this.rest.put(Routes.applicationCommands(this.client.application?.id!), { body: commands });
  }
}