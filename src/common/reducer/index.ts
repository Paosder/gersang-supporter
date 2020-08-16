import { combineReducers } from 'redux';
import login from './login';
import config from './config';
import timer from './timer';
import stopwatch from './stopwatch';
import { ConfigState } from './config/types';
import { LoginState } from './login/types';
import { TimerState } from './timer/types';
import { StopWatchState } from './stopwatch/types';


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
