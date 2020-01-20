import { Reducer } from 'redux';
import {
  ClockActions, SET_MODE, SET_TARGET_TIME, ClockState,
} from './action';

const initState = (): ClockState => ({
  mode: 'timer',
  targetTime: Date.now() + 3000,
  notification: true,
});

const reducer = (state = initState(), action: ClockActions) => {
  switch (action.type) {
    case SET_MODE:
      return {
        ...state,
        mode: action.mode,
      };
    case SET_TARGET_TIME:
      return {
        ...state,
        targetTime: action.time,
      };
    default:
      break;
  }
  return state;
};

export default reducer as Reducer;
