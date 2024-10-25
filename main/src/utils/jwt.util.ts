import { join } from 'path';
import { readFileSync } from 'fs';
import * as crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { UserRole } from '../enum/userRole.enum';

const privateKeyPath = join(__dirname, '../secret/private.key');
const publicKeyPath = join(__dirname, '../secret/public.pem');

export class JwtUtil {
  private readonly publicKey: string;
  private readonly privateKey: string;
  private readonly privateKeyPath = join(__dirname, '../secret/private.key');
  private readonly publicKeyPath = join(__dirname, '../secret/public.pem');
  private appSecret = process.env.APP_SECRET || 'secret';

    constructor(
        privateKeyContent?: string,
        publicKeyContent?: string,

    ) {
      try {
        this.privateKey = privateKeyContent || readFileSync(this.privateKeyPath, 'utf8');
        this.publicKey = publicKeyContent || readFileSync(this.publicKeyPath, 'utf8');
        console.log('Private and public keys loaded successfully.');
      } catch (error) {
        console.error('Error reading key files:', error);
        throw new Error('Could not load private/public keys');
      }
    }

    private encryptToken(text: string): string {
      const buffer = Buffer.from(text, 'utf8');
      const encrypted = crypto.publicEncrypt(this.publicKey, buffer);
      return encrypted.toString('base64');
    }

    private decryptToken(text: string): string {
      const buffer = Buffer.from(text, 'base64');
      const decrypted = crypto.privateDecrypt(this.privateKey, buffer);
      return decrypted.toString('utf8');
    }

    public sign(email: string, id: number, role: UserRole) : string {
      const token = jwt.sign({ email, id, role}, this.appSecret, { expiresIn: `${process.env.TIME_TO_LIVE || 2}h` });
      return this.encryptToken(token);
    }

    public verify(token: string): any {
      const decryptedToken = this.decryptToken(token);
      return jwt.verify(decryptedToken, this.appSecret);
    }
}

export default new JwtUtil();
