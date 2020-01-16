import React from 'react';
import { remote, BrowserWindow } from 'electron';
import { Link } from 'react-router-dom';
import path from 'path';
import url from 'url';

let configWindow: BrowserWindow;

const openConfig = () => {
  configWindow = new remote.BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
    parent: remote.getCurrentWindow(),
    modal: true,
    minimizable: false,
    maximizable: false,
    resizable: false,
  });
  configWindow.setMenu(null);
  const configUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000#/configuration'
    : `${url.format({
      pathname: path.join(remote.app.getAppPath(), './build/index.html'),
      protocol: 'file:',
      slashes: true,
    })}#/configuration`;
  configWindow.loadURL(configUrl);
};

const Main: React.FC = () => {
  const t = 4;
  return (
    <div>
      THIS IS MAIN.
      <button type="button" onClick={openConfig}>configuration</button>
    </div>
  );
};

export default Main;
