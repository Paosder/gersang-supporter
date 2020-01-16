import * as net from 'net';
import { exec } from 'child_process';

const port: string = process.env.PORT || '3000';

process.env.ELECTRON_START_URL = `http://localhost:${port}`;

const client = new net.Socket();

let startedElectron = false;
const tryConnection = () => client.connect(`${port}`, () => {
  client.end();
  if (!startedElectron) {
    startedElectron = true;
    exec('npm run electron');
  }
});

tryConnection();

client.on('error', (error) => {
  setTimeout(tryConnection, 1000);
});
