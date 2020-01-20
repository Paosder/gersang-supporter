export const SET_MODE = '@CLOCK/SET_MODE' as const;

export const SET_TARGET_TIME = '@CLOCK/SET_TARGET_TIME' as const;

type Mode = 'timer' | 'stopwatch';
export const setMode = (mode: Mode) => ({
  type: SET_MODE,
  mode,
});

export const setTargetTime = (time: number) => ({
  type: SET_TARGET_TIME,
  time,
});

export type ClockActions = ReturnType<typeof setMode>
  | ReturnType<typeof setTargetTime>;

export interface ClockState {
  mode: Mode;
  targetTime: number;
  notification: boolean;
}
