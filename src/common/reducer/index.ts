import { combineReducers } from 'redux';
import login from './login';
import config from './config';
import clock from './clock';
import { ConfigState } from './config/action';
import { LoginState } from './login/action';
import { ClockState } from './clock/action';


export interface GlobalState {
  login: LoginState;
  config: ConfigState;
  clock: ClockState;
}

export default combineReducers({
  login,
  config,
  clock,
});
