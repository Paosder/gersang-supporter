import { ThunkAction } from 'redux-thunk';
import { AnyAction } from 'redux';
import { baseUrl, encrypt } from '@common/constant';
import { remote, ipcRenderer } from 'electron';
import fs from 'fs';
import path from 'path';

export interface ConfigData {
  username: string;
  password: string;
  path: string;
  alwaysSave: string;
  alwaysRestore: string;
  title?: string;
}

export interface ConfigState {
  clients: Array<ConfigData>;
  encrypted: string;
}

export const SET_AUTOSAVE = '@CONFIG/SET_AUTO_SAVE' as const;

export const SET_AUTORESTORE = '@CONFIG/SET_AUTO_RESTORE' as const;

export const CONFIG_RELOAD = '@CONFIG/RELOAD' as const;

export const SET_USERINFO = '@CONFIG/SET_USERINFO' as const;

export const setAutoSave = (checked: boolean,
  index: number): ThunkAction<Promise<void>, {
    config: ConfigState
  }, {}, AnyAction> => async (dispatch, getState) => {
  const state = { ...getState().config };
  // alert(JSON.stringify(state.config.clients));
  state.clients[index].alwaysSave = checked ? 'true' : 'false';
  fs.writeFile(path.join(baseUrl, './config.json'),
    JSON.stringify(state, null, 2),
    (err) => {
      if (err) {
        remote.dialog.showErrorBox('설정 파일 저장 오류!',
          '알 수 없는 이유로 설정 파일을 저장할 수 없었어요! T.T');
      } else {
        dispatch({
          type: SET_AUTOSAVE,
          payload: {
            index,
            checked,
          },
        });
      }
    });
};

export const setAutoRestore = (checked: boolean,
  index: number): ThunkAction<Promise<void>, {
    config: ConfigState
  }, {}, AnyAction> => async (dispatch, getState) => {
  const state = { ...getState().config };
  // alert(JSON.stringify(state.config.clients));
  state.clients[index].alwaysRestore = checked ? 'true' : 'false';
  fs.writeFile(path.join(baseUrl, './config.json'),
    JSON.stringify(state, null, 2),
    (err) => {
      if (err) {
        remote.dialog.showErrorBox('설정 파일 저장 오류!',
          '알 수 없는 이유로 설정 파일을 저장할 수 없었어요! T.T');
      } else {
        dispatch({
          type: SET_AUTORESTORE,
          payload: {
            index,
            checked,
          },
        });
      }
    });
};

interface SaveConfigArgs {
  dirInfo?: Array<string>;
  doEncrypt?: boolean;
}

export const saveConfig = ({
  dirInfo, doEncrypt,
}: SaveConfigArgs, silent: boolean = false): ThunkAction<Promise<void>, {
    config: ConfigState
  }, {}, AnyAction> => async (dispatch, getState) => {
  const state = { ...getState().config };
  if (dirInfo) {
    dirInfo.forEach((dir, i) => {
      state.clients[i].path = dir;
    });
  }
  state.encrypted = doEncrypt ? 'true' : 'false';
  fs.writeFile(path.join(baseUrl, './config.json'),
    JSON.stringify(state, null, 2),
    (err) => {
      if (err) {
        remote.dialog.showErrorBox('설정 파일 저장 오류!',
          '알 수 없는 이유로 설정 파일을 저장할 수 없었어요! T.T');
      } else {
        ipcRenderer.send('change-config', silent);
        dispatch(configReload());
      }
    });
};

export const configReload = () => ({
  type: CONFIG_RELOAD,
});

export const setUserInfo = (username: string,
  password: string, index: number): ThunkAction<Promise<void>, {
    config: ConfigState
  }, {}, AnyAction> => async (dispatch, getState) => {
  dispatch({
    type: SET_USERINFO,
    payload: {
      username: encrypt(username),
      password: encrypt(password),
      index,
    },
  });
  dispatch(saveConfig({ doEncrypt: getState().config.encrypted === 'true' }, true));
};

export type ConfigActions = {
  type: typeof SET_AUTOSAVE,
  payload: {
    index: number,
    checked: boolean,
  }
} | {
  type: typeof SET_AUTORESTORE,
  payload: {
    index: number,
    checked: boolean,
  }
} | {
  type: typeof SET_USERINFO,
  payload: {
    username: string,
    password: string,
    index: number,
  }
} | {
  type: typeof CONFIG_RELOAD,
};
