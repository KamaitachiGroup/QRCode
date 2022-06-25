import { JSONObject } from './src/types/json';
import { config } from './config';
import { Client, Intents } from 'discord.js';
import { Postgres } from './src/services/postgres';

const postgres = new Postgres(config.postgres as JSONObject);
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// When the client is ready, run this code (only once)
client.once('ready', async () => {
	await postgres.init();
	console.log('Ready!');
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
