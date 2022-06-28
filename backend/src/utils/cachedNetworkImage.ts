import { promises as fs } from 'fs';
import { Hash } from './hash';
import * as https from 'https';

export type GetOptions = {
  cacheDuration?: number;
  invalidateCache?: boolean;
};

export class cachedNetworkImage {
  static path: string;

  static async init(path: string): Promise<void> {
    cachedNetworkImage.path = path;
    await fs.mkdir(path);
  }

  private static async downloadImage(url: string, savePath: string): Promise<Buffer> {
    const chunks: Buffer[] = [];
    let resolve, reject;
    
    const promise = new Promise<Buffer>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    const request = https.request(url, res => {
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
      });
    });
    request.end();

    const buffer = await promise;
    await fs.writeFile(savePath, buffer);
    return buffer;
  }

  private static async fetchLocaly(path: string): Promise<Buffer> {
    return fs.readFile(path);
  }

  static async get(url: string, opts: GetOptions = {}): Promise<Buffer> {
    const hash = Hash.sha256(url);

    const filePath = `${cachedNetworkImage.path}/${hash}`;
    try {
      const stats = await fs.stat(filePath);

      if (! stats.isFile() || opts.invalidateCache || (opts.cacheDuration && (Date.now() - stats.mtime.getTime() > opts.cacheDuration))) {
        return cachedNetworkImage.downloadImage(url, filePath);
      }
      return cachedNetworkImage.fetchLocaly(filePath);
    } catch (e) {
      
    }
    return cachedNetworkImage.downloadImage(url, filePath);
  }
}