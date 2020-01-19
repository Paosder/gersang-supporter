import { combineReducers } from 'redux';
import main from './main';
import config from './config';
import { ConfigState } from './config/action';
import { LoginState } from './main/action';


export type GlobalState = {
  main: LoginState,
  config: ConfigState,
};

export default combineReducers({
  main,
  config,
});
