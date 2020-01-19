import { Reducer } from 'redux';
import { EnumLoginState, MainActions, LoginState } from './action';


const initState = (): LoginState => ({
  status: EnumLoginState.LOGOUT,
  clientIndex: 0,
});


const reducer = (state = initState(), action: MainActions) => {
  switch (action.type) {
    case '@MAIN/SET_STATUS':
      return {
        status: action.status,
        clientIndex: action.index,
      };
    default:
      break;
  }
  return state;
};

export default reducer as Reducer;
