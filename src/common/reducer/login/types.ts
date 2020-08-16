
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
