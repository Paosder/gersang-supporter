import { ThunkAction } from 'redux-thunk';

export const SET_STATUS = '@STOPWATCH/SET_STATUS' as const;

export const SET_BASE_TIME = '@STOPWATCH/SET_BASE_TIME' as const;

export const INCREASE_ELAPSED_TIME = '@STOPWATCH/INCREASE_ELAPSED_TIME' as const;

type StopWatchStatus = 'START' | 'PAUSE' | 'STOP';

export const setStatus = (status: StopWatchStatus) => ({
  type: SET_STATUS,
  status,
});

export const setBaseTime = (time: number) => ({
  type: SET_BASE_TIME,
  time,
});

const increaseElapsedTime = (time: number) => ({
  type: INCREASE_ELAPSED_TIME,
  time,
});

export const startStopwatch = (): ThunkAction<Promise<void>, {
  stopwatch: StopWatchState
}, {}, StopWatchActions> => async (dispatch, getState) => {
  if (getState().stopwatch.status === 'START') {
    return;
  }
  dispatch(setStatus('START'));
  const stopwatch = setInterval(() => {
    if (getState().stopwatch.status === 'START') {
      dispatch(increaseElapsedTime(Date.now()));
    } else {
      clearInterval(stopwatch);
    }
  }, 10);
};


export type StopWatchActions = ReturnType<typeof setBaseTime>
  | ReturnType<typeof increaseElapsedTime>
  | ReturnType<typeof setStatus>;

export interface StopWatchState {
  elapsedTime: number;
  baseTime: number;
  status: StopWatchStatus;
}
