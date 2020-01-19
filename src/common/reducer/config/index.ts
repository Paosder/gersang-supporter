import fs from 'fs';
import path from 'path';
import { Reducer } from 'redux';
import { baseUrl } from '@common/constant';
import {
  ConfigState, ConfigActions, SET_AUTOSAVE, SET_USERINFO, CONFIG_RELOAD,
} from './action';

const initState = (): ConfigState => {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(baseUrl, './config.json'), { encoding: 'utf8' }));
    return data as ConfigState;
  } catch {
    // if config.json does not exists (critical)
    return {
      clients: [],
      encrypted: 'false',
    };
  }
};

const reducer = (state = initState(), action: ConfigActions) => {
  switch (action.type) {
    case SET_AUTOSAVE: {
      const newState = { ...state };
      const checked = action.checked ? 'true' : 'false';
      newState.clients[action.index].alwaysSave = checked;
      return newState;
    }
    case SET_USERINFO: {
      const newState = { ...state };
      newState.clients[action.index].username = action.username;
      newState.clients[action.index].password = action.password;
      return newState;
    }
    case CONFIG_RELOAD: {
      const newState = initState();
      return newState;
    }
    default:
      break;
  }
  return state;
};

export default reducer as Reducer;
