import { Reducer } from 'redux';
// import { NotificationIcon } from '@common/icons';
import {
  StopWatchActions, SET_BASE_TIME,
  INCREASE_ELAPSED_TIME, SET_STATUS,
} from './action';
import { StopWatchState } from './types';

const initState = (): StopWatchState => ({
  baseTime: Date.now(),
  elapsedTime: 0,
  status: 'STOP',
});

const reducer = (state = initState(), action: StopWatchActions) => {
  switch (action.type) {
    case SET_STATUS:
      if (action.status === 'STOP') {
        return {
          ...state,
          elapsedTime: 0,
          status: action.status,
        };
      }
      return {
        ...state,
        status: action.status,
      };
    case SET_BASE_TIME:
      return {
        ...state,
        baseTime: action.time,
      };
    case INCREASE_ELAPSED_TIME: {
      return {
        ...state,
        elapsedTime: state.elapsedTime + (action.time - state.baseTime),
        baseTime: action.time,
      };
    }
    default:
      break;
  }
  return state;
};

export default reducer as Reducer;
