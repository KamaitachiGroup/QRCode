import { JSONArray, JSONObject } from "../types/json";
import ms from 'ms';
import { Client } from 'pg';

export class Postgres {

  private config: JSONObject;
  private client?: Client;

  constructor(config: JSONObject) {
    this.config = config;
  }

  /**
   * Initialize the Postgres service
   */
  async init() {
    console.debug('Trying to connect to Postgres');
    let retries = 0;
    const retryDelay = ms(this.config.retryDelay as string);

    while (retries < this.config.maxRetries!) {
      try {
        await this.connect();
        console.debug('Connected to Postgres');
        break;
      } catch (err) {
        retries++;
        if (retries >= this.config.maxRetries!) {
          console.error('Could not connect to Postgres in time');
          throw err;
        } else {
          console.debug('Waiting for postgres...');
        }
      }
      await this.sleep(retryDelay);
    }
  }

  private async sleep(retryDelay: number): Promise<void> {
    let resolve: any;
    const promise = new Promise<void>(resolveFn => resolve = resolveFn);
    setTimeout(() => resolve(), retryDelay);
    return promise;
  }

  private async connect(): Promise<void> {
    this.client = new Client(this.config);
    await this.client.connect();
  }

  async query (query: string, params: JSONArray) {
    if (!this.client) {
      throw new Error('Postgres client not initialized');
    }
    return this.client.query(query, params);
  }
}