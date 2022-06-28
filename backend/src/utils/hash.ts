import crypto from 'crypto';

export class Hash {
  static sha256(str: string): string {
    return crypto.createHash('sha256').update(str).digest('hex');
  }
}