import { Reducer } from 'redux';
import { NotificationIcon } from '@common/icons';
import {
  ClockActions, SET_MODE, SET_LEFT_TIME,
  DECREASE_LEFT_TIME, SET_STATUS, ClockState,
} from './action';

const initState = (): ClockState => ({
  mode: 'timer',
  leftTime: 0,
  status: 'STOP',
  notification: true,
});

const reducer = (state = initState(), action: ClockActions) => {
  switch (action.type) {
    case SET_MODE:
      return {
        ...state,
        mode: action.mode,
      };
    case SET_STATUS:
      if (action.status === 'STOP') {
        return {
          ...state,
          leftTime: 0,
          status: action.status,
        };
      }
      return {
        ...state,
        status: action.status,
      };
    case SET_LEFT_TIME:
      return {
        ...state,
        leftTime: action.time,
      };
    case DECREASE_LEFT_TIME: {
      if (state.status === 'START'
        && state.leftTime - action.time < 0) {
        const t = new Notification('Gersang Supporter', {
          icon: NotificationIcon,
          body: '시간이 경과되었어요 !',
        });
        return {
          ...state,
          leftTime: 0,
          status: 'STOP',
        };
      }
      return {
        ...state,
        leftTime: state.leftTime - action.time,
      };
    }
    default:
      break;
  }
  return state;
};

export default reducer as Reducer;
