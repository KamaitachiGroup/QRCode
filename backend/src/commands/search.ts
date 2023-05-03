import { SlashCommandBuilder } from '@discordjs/builders';
import { CacheType, CommandInteraction, Client, GuildVoiceChannelResolvable, BaseGuild, BaseGuildVoiceChannel, MessagePayload, MessageAttachment } from 'discord.js';
import { Command } from '../core/commands/command';
import { Postgres } from '../services/postgres';
import { Console } from 'node:console'
import { Transform } from 'node:stream'

const ts = new Transform({ transform(chunk, enc, cb) { cb(null, chunk) } })

function getTable(data: any): string {
  const logger = new Console({ stdout: ts });
  logger.table(data);
  return (ts.read() || '').toString();
}

export class SearchCommand extends Command {
  private postgres: Postgres;

  constructor (postgres: Postgres) {
    super('search');
    this.postgres = postgres;
  }

  protected buildCommand(commandBuilder: SlashCommandBuilder): void {
    
    commandBuilder
      .setDescription('Search messages through the logs')
      .addBooleanOption( option => option.setName('publish').setRequired(false).setDescription('Show results to everyone') )
      .addUserOption( option => option.setName('author').setRequired(false).setDescription('The user who authored the message') )
      .addStringOption( option => option.setName('author_id').setRequired(false).setDescription('Id of the user who authored the message') )
      .addStringOption( option => option.setName('author_name').setRequired(false).setDescription('username of the user who authored the message') )
      .addUserOption( option => option.setName('actor').setRequired(false).setDescription('The user who acted on the message') )
      .addStringOption( option => option.setName('actor_id').setRequired(false).setDescription('Id of the user who acted on the message') )
      .addStringOption( option => option.setName('actor_name').setRequired(false).setDescription('username of the user who acted on the message') )
      .addStringOption( option => option.setName('channel_name').setRequired(false).setDescription('The name of channel in which the message has been created/updated/deleted') )
      .addStringOption( option => option.setName('channel_id').setRequired(false).setDescription('The channelId of channel in which the message has been created/updated/deleted') )
      .addChannelOption( option => option.setName('channel').setRequired(false).setDescription('The channel in which the message has been created/updated/deleted') )
      .addStringOption( option => option.setName('message').setRequired(false).setDescription('The content of the message to match') )
      .addStringOption( option => option.setName('limit').setRequired(false).setDescription('The maximum number of returned value') )
      .addStringOption( option => option.setName('message_id').setRequired(false).setDescription('The messageId of the message') )
      .addBooleanOption( option => option.setName('is_bot').setRequired(false).setDescription('Whether the message has been authored by a bot') )
      .addBooleanOption( option => option.setName('is_command').setRequired(false).setDescription('Whether the message is a command') )
      .addStringOption( option => option.setName('from').setRequired(false).setDescription('The date to search from') )
      .addStringOption( option => option.setName('to').setRequired(false).setDescription('The date to search to') )
      .addStringOption( option => option.setName('action').setRequired(false).setDescription('The action on the message').addChoices(
        { name: 'Create', value: 'CREATE' },
        { name: 'Update', value: 'UPDATE' },
        { name: 'Delete', value: 'DELETE' } 
      ))
      .addStringOption( option => option.setName('sort').setRequired(false).setDescription('Sort the results').addChoices(
        { name: 'Ascend', value: 'ASC' },
        { name: 'Descend', value: 'DESC' }
      )).setDefaultMemberPermissions(1<<3);
  }
  public async execute(interaction: CommandInteraction<CacheType>, client: Client): Promise<void> {
    const author = interaction.options.getUser('author', false);
    const authorId = interaction.options.getString('author_id', false);
    const authorname = interaction.options.getString('author_name', false);
    const actor = interaction.options.getUser('actor', false);
    const actorId = interaction.options.getString('actor_id', false);
    const actorname = interaction.options.getString('actor_name', false);
    const channelName = interaction.options.getString('channel_name', false);
    const channelId = interaction.options.getString('channel_id', false);
    const channel = interaction.options.getChannel('channel', false);
    const message = interaction.options.getString('message', false);
    const messageId = interaction.options.getString('message_id', false);
    const from = interaction.options.getString('from', false);
    const to = interaction.options.getString('to', false);
    const action = interaction.options.getString('action', false);
    const isBot = interaction.options.getBoolean('is_bot', false);
    const publish = interaction.options.getBoolean('publish', false);
    const sort = interaction.options.getString('sort', false);
    const isCommand = interaction.options.getBoolean('is_command', false);
    const limit = parseInt(interaction.options.getString('limit', false) || '') || 50;


    if (! interaction.guild) {
      await interaction.reply({content: 'You can only search text in a guild', ephemeral: true});
      return;
    }

    const guild = interaction.guild as BaseGuild;

    await interaction.deferReply({
      ephemeral: !publish,
    });

    const _from = from ? new Date(from).toISOString() : null;
    const _to = to ? new Date(to).toISOString() : null;

    const limitQuery = limit ? `LIMIT ${limit}` : '';

    const results = await this.postgres.query(`
      SELECT * FROM messages
        WHERE guild_id = $1
          AND ( $2::TEXT IS NULL OR author_id = $2 )
          AND ( $3::TEXT IS NULL OR channel_id = $3 )
          AND ( $4::TEXT IS NULL OR POSITION($4 IN LOWER(channel_name)) > 0 )
          AND ( $5::TEXT IS NULL OR message_id = $5 )
          AND ( $6::TEXT IS NULL OR action = $6 )
          AND ( $7::TIMESTAMP IS NULL OR entry_date >= $7::TIMESTAMP )
          AND ( $8::TIMESTAMP IS NULL OR entry_date <= $8::TIMESTAMP )
          AND ( $9::BOOLEAN IS NULL OR is_bot = $9::BOOLEAN )
          AND ( $10::TEXT IS NULL OR POSITION($10 IN LOWER(message)) > 0 )
          AND ( $11::TEXT IS NULL OR POSITION($11 IN LOWER(author_name)) > 0 )
          AND ( $12::TEXT IS NULL OR POSITION($12 IN LOWER(actor_name)) > 0 )
          AND ( $13::TEXT IS NULL OR actor_id = $13 )
          AND ( $14::BOOLEAN IS NULL OR is_command = $14::BOOLEAN )
          ORDER BY entry_date ${sort === 'ASC' ? 'ASC' : 'DESC'}
          ${limitQuery}
    `, [
      guild.id,
      author?.id ?? authorId ?? null,
      channelId ?? channel?.id ?? null,
      channelName?.toLowerCase() ?? channel?.name?.toLowerCase() ?? null,
      messageId ?? null,
      action ?? null,
      _from,
      _to,
      isBot,
      message?.toLowerCase() ?? null,
      authorname?.toLowerCase() ?? null,
      actorname?.toLowerCase() ?? null,
      actor?.id ?? actorId ?? null,
      isCommand,
    ]);

    try {
      const attachment = new MessageAttachment(
        Buffer.from(getTable(results.rows), 'utf8'),
        'search.txt',
      );
      await interaction.editReply({
        files: [attachment],
      });
    } catch {

    }
  }

}
