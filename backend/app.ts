import { JSONObject } from './src/types/json';
import { config } from './config';
import { Client, Intents } from 'discord.js';
import { Postgres } from './src/services/postgres';
import { CommandManager } from './src/core/commands/commandManager';
import { MessageLogger } from './src/message/MessageLogger';
import { InvokeCommand } from './src/commands/invoke';
import { LoLPickerCommand } from './src/commands/lolpicker';
import { SearchCommand } from './src/commands/search';
import { GlouGlouEpitechCommand } from './src/commands/glouGlouEpitech';

const postgres = new Postgres(config.postgres as JSONObject);
const client = new Client({ intents: [
	Intents.FLAGS.GUILDS,
	Intents.FLAGS.GUILD_VOICE_STATES,
	Intents.FLAGS.GUILD_MESSAGES,
	Intents.FLAGS.GUILD_MEMBERS,
] });
const commandManager = new CommandManager(client, postgres);
const messageLogger = new MessageLogger(client, postgres);

// When the client is ready, run this code (only once)
client.once('ready', async () => {
	await postgres.init();
	await messageLogger.init();
	await commandManager.init();
	
	commandManager.addCommand(new InvokeCommand());
	commandManager.addCommand(new LoLPickerCommand());
	commandManager.addCommand(new SearchCommand(postgres));
	commandManager.addCommand(new GlouGlouEpitechCommand());
	await commandManager.registerCommands();
	console.log('Ready!');
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
