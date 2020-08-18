import { ThunkAction } from 'redux-thunk';
import { AnyAction } from 'redux';
import { reqGameExecute, reqLogin, registerCallback } from '@common/ipc/req';
import { remote } from 'electron';
import { decrypt } from '@common/constant';
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
      // already logged in.
      const { path, alwaysRestore } = configClients[index];
      const { path: restorePath } = configClients[0];
      reqGameExecute(index, path, alwaysRestore === 'true', restorePath);
      return;
    }
    case EnumLoginState.LOGOUT: {
      // not login state (first phase).
      const { username: u, password: p } = configClients[index];

      if (!u || !p) {
        remote.dialog.showErrorBox('아이디 비밀번호가 이상해요!', `
          아이디, 비밀번호가 이상해요!
          혹시 이전에 한번이라도 로그인을 안하셨던게 아닐까요?

          인식된 아이디: '${u}'
          인식된 비밀번호: '${p.split('').map(() => '●').join()}'
        `);
        return;
      }
      const { encrypted } = getState().config;
      const username = encrypted ? decrypt(u) : u;
      const password = encrypted ? decrypt(p) : p;
      reqLogin(index, username, password, (res: { status: boolean, reason: string}) => {
        if (res.status) {
          // true. go next stage.
          setTimeout(() => {
            dispatch(executeDirect(index));
          }, 50);
        } else if (res.reason === 'otp-required') {
          // otp required. attach callback again.
          registerCallback('request-login', (nextRes: { status: boolean, reason: string }) => {
            if (nextRes.status) {
              // success to login. go next stage.
              setTimeout(() => {
                dispatch(executeDirect(index));
              });
            }
            // else, it fails.
          });
        }
      });
    }
  }
};

export type MainActions = ReturnType<typeof setStatus> |
  ReturnType<typeof reInitActiveClients>;
