import { Reducer } from 'redux';
import {
  MainActions,
  REINIT_ACTIVE_CLIENTS, SET_STATUS,
} from './action';
import { EnumLoginState, LoginState } from './types';


const initState = (): LoginState => ({
  clients: [{
    status: EnumLoginState.LOGOUT,
  }, {
    status: EnumLoginState.LOGOUT,
  }, {
    status: EnumLoginState.LOGOUT,
  }],
});


const reducer = (state = initState(), action: MainActions) => {
  switch (action.type) {
    case SET_STATUS: {
      const newState = {
        ...state,
      };
      newState.clients[action.payload.index].status = action.payload.status;
      return newState;
    }
    case REINIT_ACTIVE_CLIENTS: {
      const newClients = [];
      for (let i = 0; i < action.payload.clientLength; i += 1) {
        newClients.push({
          status: EnumLoginState.LOGOUT,
        });
        if (state.clients[i]) {
          // copy current state if exists.
          newClients[i].status = state.clients[i].status;
        }
      }
      return {
        clients: newClients,
      };
    }
    default:
      break;
  }
  return state;
};

export default reducer as Reducer;
