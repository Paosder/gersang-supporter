import { ipcRenderer } from 'electron';

export const reqLogin = (index: number, id: string, password: string) => {
  ipcRenderer.send('request-login', {
    id,
    password,
    index,
  });
};

export const reqLogout = (index?: number, forced: boolean = false) => {
  ipcRenderer.send('request-logout', {
    index,
    forced,
  });
};

export const reqGameExecute = (index: number,
  path: string, restore: boolean, restorePath: string) => {
  ipcRenderer.send('execute-game', {
    index,
    path,
    restorePath,
    restore,
  }); // set client number
};

export const reqOtpAuthKeys = (data: string) => {
  ipcRenderer.send('request-otp', data);
};

export const reqChangeConfig = (silent: boolean) => {
  ipcRenderer.send('change-config', silent);
};

export const reqOpenClientGenerator = () => {
  ipcRenderer.send('open-client-generator', '');
};

export const reqToggleBrowserOpen = () => {
  ipcRenderer.send('toggle-browser');
};

export const reqOpenConfig = () => {
  ipcRenderer.send('open-configuration', '');
};
