import { ThunkAction } from 'redux-thunk';

export const SET_STATUS = '@TIMER/SET_STATUS' as const;

export const SET_LEFT_TIME = '@TIMER/SET_LEFT_TIME' as const;

export const DECREASE_LEFT_TIME = '@TIMER/DECREASE_LEFT_TIME' as const;

type TimerStatus = 'START' | 'PAUSE' | 'STOP';

export const setStatus = (status: TimerStatus) => ({
  type: SET_STATUS,
  status,
});

export const setLeftTime = (time: number) => ({
  type: SET_LEFT_TIME,
  time,
});

const decreaseLeftTime = (time: number) => ({
  type: DECREASE_LEFT_TIME,
  time,
});

export const startTimer = (): ThunkAction<Promise<void>, {
  timer: TimerState
}, {}, TimerActions> => async (dispatch, getState) => {
  if (getState().timer.status === 'START') {
    return;
  }
  dispatch(setStatus('START'));
  const timer = setInterval(() => {
    if (getState().timer.status === 'START') {
      dispatch(decreaseLeftTime(100));
    } else {
      clearInterval(timer);
    }
  }, 100);
};


export type TimerActions = ReturnType<typeof setLeftTime>
  | ReturnType<typeof decreaseLeftTime>
  | ReturnType<typeof setStatus>;

export interface TimerState {
  leftTime: number;
  notification: boolean;
  status: TimerStatus;
}
