export const SET_STATUS = '@MAIN/SET_STATUS' as const;

export const REINIT_ACTIVE_CLIENTS = '@MAIN/REINIT_ACTIVE_CLIENTS' as const;

export enum EnumLoginState {
  AUTH_FAILED,
  LOGOUT,
  WAIT_OTP,
  SEND_AUTH,
  SEND_OTP,
  LOGIN,
}

export interface LoginState {
  clients: Array<{
    status: EnumLoginState;
  }>
}

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

export type MainActions = ReturnType<typeof setStatus> |
  ReturnType<typeof reInitActiveClients>;
