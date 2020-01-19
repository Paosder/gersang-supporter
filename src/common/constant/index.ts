import path from 'path';
import { remote } from 'electron';
import crypto from 'crypto';
import getMAC from 'getmac';

const mac = getMAC();

// eslint-disable-next-line
export const baseUrl = process.env.NODE_ENV === 'development'
  ? path.join(remote.app.getAppPath(), '../main/') : path.dirname(remote.app.getPath('exe'));

export interface GlobalState<T> {
  [key: string]: T;
}


const ENCRYPTION_KEY = `$VPP0RT$${mac}G%RS@NG`; // Must be 256 bits (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16

export const encrypt = (text: string) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

export const decrypt = (text: string) => {
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch {
    return '';
  }
};
