import { ThunkAction } from 'redux-thunk';
import { AnyAction } from 'redux';
import { reqGameExecute, reqLogin } from '@common/ipc/req';
import { ConfigState } from '../config/types';
import { EnumLoginState, LoginState } from './types';

export const SET_STATUS = '@MAIN/SET_STATUS' as const;

export const REINIT_ACTIVE_CLIENTS = '@MAIN/REINIT_ACTIVE_CLIENTS' as const;


export const setStatus = (index: number, status: EnumLoginState) => ({
  type: SET_STATUS,
  payload: {
    index,
    status,
  },
});

export const reInitActiveClients = (clientLength: number) => ({
  type: REINIT_ACTIVE_CLIENTS,
  payload: {
    clientLength,
  },
});

export const executeDirect = (index: number): ThunkAction<Promise<void>, {
    config: ConfigState,
    login: LoginState,
  }, {}, AnyAction> => async (dispatch, getState) => {
  const configClients = getState().config.clients;
  const loginClients = getState().login.clients;

  const { status } = loginClients[index];

  switch (status) {
    case EnumLoginState.LOGIN: {
      const { path, alwaysRestore } = configClients[index];
      const { path: restorePath } = configClients[0];
      reqGameExecute(index, path, alwaysRestore === 'true', restorePath);
      return;
    }
    case EnumLoginState.LOGOUT: {
      const { username, password } = configClients[index];
      reqLogin(index, username, password, (res: any) => {
        console.log(res);
      });
    }
    default:
      break;
      // wrong?
  }
  // dispatch again to wait next response.
  dispatch(executeDirect(index));
  // dispatch({
  //   type: SET_USERINFO,
  //   payload: {
  //     username: encrypt(username),
  //     password: encrypt(password),
  //     index,
  //   },
  // });
  // dispatch(saveConfig({ doEncrypt: getState().config.encrypted === 'true' }, true));
};

export type MainActions = ReturnType<typeof setStatus> |
  ReturnType<typeof reInitActiveClients>;
