import { JSONObject } from './src/types/json';
import { config } from './config';
import { Client, Intents } from 'discord.js';
import { Postgres } from './src/services/postgres';
import { CommandManager } from './src/core/commands/commandManager';
import { InvokeCommand } from './src/commands/invoke';
import { LoLPickerCommand } from './src/commands/lolpicker';

const postgres = new Postgres(config.postgres as JSONObject);
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES] });
const commandManager = new CommandManager(client);

// When the client is ready, run this code (only once)
client.once('ready', async () => {
	await postgres.init();
	commandManager.addCommand(new InvokeCommand());
	commandManager.addCommand(new LoLPickerCommand())
	await commandManager.registerCommands();
	console.log('Ready!');
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
