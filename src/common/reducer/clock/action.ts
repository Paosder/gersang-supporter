import { ThunkAction } from 'redux-thunk';

export const SET_MODE = '@CLOCK/SET_MODE' as const;

export const SET_STATUS = '@CLOCK/SET_STATUS' as const;

export const SET_LEFT_TIME = '@CLOCK/SET_LEFT_TIME' as const;

export const DECREASE_LEFT_TIME = '@CLOCK/DECREASE_LEFT_TIME' as const;

type ClockStatus = 'START' | 'PAUSE' | 'STOP';

type Mode = 'timer' | 'stopwatch';
export const setMode = (mode: Mode) => ({
  type: SET_MODE,
  mode,
});

export const setStatus = (status: ClockStatus) => ({
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
  clock: ClockState
}, {}, ClockActions> => async (dispatch, getState) => {
  if (getState().clock.status === 'START') {
    return;
  }
  dispatch(setStatus('START'));
  const timer = setInterval(() => {
    if (getState().clock.status === 'START') {
      dispatch(decreaseLeftTime(100));
    } else {
      clearInterval(timer);
    }
  }, 100);
};


export type ClockActions = ReturnType<typeof setMode>
  | ReturnType<typeof setLeftTime>
  | ReturnType<typeof decreaseLeftTime>
  | ReturnType<typeof setStatus>;

export interface ClockState {
  mode: Mode;
  leftTime: number;
  notification: boolean;
  status: ClockStatus;
}
