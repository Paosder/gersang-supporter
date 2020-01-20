export const SET_STATUS = '@MAIN/SET_STATUS' as const;

export enum EnumLoginState {
  AUTH_FAILED,
  LOGOUT,
  WAIT_OTP,
  SEND_AUTH,
  SEND_OTP,
  LOGIN,
}

export interface LoginState {
  status: EnumLoginState;
  clientIndex: number;
}

export const setStatus = (index: number, status: EnumLoginState) => ({
  type: SET_STATUS,
  index,
  status,
});

export type MainActions = ReturnType<typeof setStatus>;
