import { SlashCommandBuilder } from '@discordjs/builders';
import { CacheType, CommandInteraction, Client, GuildVoiceChannelResolvable, BaseGuild, BaseGuildVoiceChannel } from 'discord.js';
import { Command } from '../core/commands/command';

export class InvokeCommand extends Command {
  constructor () {
    super('invoke');
  }

  protected buildCommand(commandBuilder: SlashCommandBuilder): void {
    commandBuilder
      .setDescription('Invoke a user by moving it into channels')
      .addUserOption( option => option.setName('user').setRequired(true).setDescription('The user to invoke') )
      .addIntegerOption( option => option.setName('time').setRequired(false).setDescription('Maximum invocation time in seconds') )
      .addIntegerOption( option => option.setName('delay').setRequired(false).setDescription('Delay between each channel move in ms') );
  }
  public async execute(interaction: CommandInteraction<CacheType>, client: Client): Promise<void> {
    const user = interaction.options.getUser('user', true);
    const time = interaction.options.getInteger('time', false) || 10;
    const delay = interaction.options.getInteger('delay', false) || 500;

    if (! interaction.guild) {
      await interaction.reply({content: 'You can only invoke users in a guild', ephemeral: true});
      return;
    }

    const member = await interaction.guild?.members.fetch(user.id);

    if (! member) {
      await interaction.reply({content: 'Could not find user', ephemeral: true});
      return;
    }

    if (! member.voice.channel) {
      await interaction.reply({content: 'User is not in a voice channel', ephemeral: true});
      return;
    }

    const channels = await member.guild.channels.fetch();
    const voiceChannels = await channels.filter(channel => {
      return channel.isVoice()
        && channel.id !== member.voice.channel!.id
        && (channel as BaseGuildVoiceChannel).members.size === 0;
    });

    await interaction.reply({content: `Invoking ${member.user.tag}`, ephemeral: true});

    const start = Date.now();
    const baseChannel = member.voice.channel;
    let firstMove = false;
    const invokeMethod = async () => {
      if (Date.now() - start > time * 1000) {
        await member.voice.setChannel(baseChannel);
        return;
      }

      if (! member.voice.channel) {
        return;
      }

      if (firstMove && member.voice.channel.id === baseChannel.id) {
        return;
      }

      await member.voice.setChannel(voiceChannels.random() as GuildVoiceChannelResolvable);
      firstMove = true;
      setTimeout(invokeMethod, delay);
    };

    await invokeMethod();
  }

}
