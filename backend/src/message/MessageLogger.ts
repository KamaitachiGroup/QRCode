import { Client, Message, MessageInteraction, PartialMessage, TextChannel } from 'discord.js';
import { Postgres } from '../services/postgres';

export class MessageLogger {
  private client: Client;
  private postgres: Postgres;

  constructor (client: Client, postgres: Postgres) {
    this.client = client;
    this.postgres = postgres;
  }

  public async init(): Promise<void> {
    this.client.on('messageCreate', this.onMessageCreate.bind(this));
    this.client.on('messageUpdate',this.onMessageUpdated.bind(this));
    this.client.on('messageDelete', this.onMessageDelete.bind(this));
  }

  private async onMessageCreate(message: Message): Promise<void> {
    await this.postgres.query('INSERT INTO messages (guild_id, channel_id, author_id, message_id, guild_name, channel_name, author_name, message, action, is_bot, actor_id, actor_name) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
    [message.guildId, message.channelId, message.author?.id, message.id, message.guild?.name ?? null, (message.channel as TextChannel)?.name, message.author.username, message.content, 'CREATE', message.author.bot, message.author.id, message.author.username]);
  }

  private async onMessageUpdated(oldMessage: Message | PartialMessage, newMessage: Message | PartialMessage): Promise<void> {
    await this.postgres.query('INSERT INTO messages (guild_id, channel_id, author_id, message_id, guild_name, channel_name, author_name, message, action, is_bot, actor_id, actor_name) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
    [newMessage.guildId, newMessage.channelId, newMessage.author?.id ?? null, newMessage.id, newMessage.guild?.name ?? null, (newMessage.channel as TextChannel)?.name, newMessage.author?.username ?? null, newMessage.content, 'UPDATE', newMessage.author?.bot ?? false, newMessage.author?.id  ?? null, newMessage.author?.username ?? null]);
  }

  private async onMessageDelete(message: Message | PartialMessage): Promise<void> {
    let interaction: MessageInteraction | null = null;
    try {
      interaction = message.interaction;
    } catch (e) {
      interaction = null;
    }
    await this.postgres.query('INSERT INTO messages (guild_id, channel_id, author_id, message_id, guild_name, channel_name, author_name, message, action, is_bot, actor_id, actor_name) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
    [message.guildId, message.channelId, message.author?.id ?? null, message.id, message.guild?.name ?? null, (message.channel as TextChannel)?.name, message.author?.username ?? null, message.content, 'DELETE', message.author?.bot ?? false, interaction?.user.id ?? null, interaction?.user.username ?? null]);
  }
  
}