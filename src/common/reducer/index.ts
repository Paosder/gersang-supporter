import { combineReducers } from 'redux';
import login from './login';
import config from './config';
import timer from './timer';
import stopwatch from './stopwatch';
import { ConfigState } from './config/action';
import { LoginState } from './login/action';
import { TimerState } from './timer/action';
import { StopWatchState } from './stopwatch/action';


export interface GlobalState {
  login: LoginState;
  config: ConfigState;
  timer: TimerState;
  stopwatch: StopWatchState;
}

export default combineReducers({
  login,
  config,
  timer,
  stopwatch,
});
