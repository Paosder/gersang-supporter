export type TimerStatus = 'START' | 'PAUSE' | 'STOP';

export interface TimerState {
  leftTime: number;
  notification: boolean;
  status: TimerStatus;
}
