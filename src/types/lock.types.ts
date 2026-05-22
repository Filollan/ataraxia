export type LockType = 'time_limit' | 'fixed_schedule';

export interface LockConfig {
  isEnabled: boolean;
  lockType: LockType;
  timeLimitMinutes: number;
  fixedScheduleTime: string; // Format "HH:MM"
  socialAppsBlocked: string[];
}

export interface LockState {
  isSimulatedLocked: boolean;
  accumulatedUsageMinutes: number;
  lastUsageUpdateTimestamp: number;
  streakDays: number;
  penaltiesCount: number;
  lastCheckDate: string; // Format "YYYY-MM-DD"
}
