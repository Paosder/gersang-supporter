export type StopWatchStatus = 'START' | 'PAUSE' | 'STOP';

export interface StopWatchState {
  elapsedTime: number;
  baseTime: number;
  status: StopWatchStatus;
}
