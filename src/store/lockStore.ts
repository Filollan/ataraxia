import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LockConfig, LockState } from '../types';

interface LockStore {
  config: LockConfig;
  lockState: LockState;
  updateConfig: (updates: Partial<LockConfig>) => void;
  setSimulatedLocked: (locked: boolean) => void;
  accumulateUsageTime: (minutes: number) => void;
  exitAppPenalty: () => void;
  resetDailyStatsIfNeeded: () => void;
  resetAll: () => void;
}

const DEFAULT_CONFIG: LockConfig = {
  isEnabled: false,
  lockType: 'time_limit',
  timeLimitMinutes: 30,
  fixedScheduleTime: '22:00',
  socialAppsBlocked: ['Instagram', 'TikTok', 'Facebook', 'Twitter', 'YouTube'],
};

const DEFAULT_STATE: LockState = {
  isSimulatedLocked: false,
  accumulatedUsageMinutes: 0,
  lastUsageUpdateTimestamp: 0,
  streakDays: 0,
  penaltiesCount: 0,
  lastCheckDate: new Date().toISOString().split('T')[0],
};

export const useLockStore = create<LockStore>()(
  persist(
    (set, get) => ({
      config: DEFAULT_CONFIG,
      lockState: DEFAULT_STATE,

      updateConfig: (updates) =>
        set((state) => ({
          config: { ...state.config, ...updates },
        })),

      setSimulatedLocked: (locked) =>
        set((state) => ({
          lockState: { ...state.lockState, isSimulatedLocked: locked },
        })),

      accumulateUsageTime: (minutes) =>
        set((state) => {
          const newUsage = state.lockState.accumulatedUsageMinutes + minutes;
          // Auto-engage lock if limit reached and type is time_limit and config is enabled
          const shouldLock =
            state.config.isEnabled &&
            state.config.lockType === 'time_limit' &&
            newUsage >= state.config.timeLimitMinutes;

          return {
            lockState: {
              ...state.lockState,
              accumulatedUsageMinutes: newUsage,
              isSimulatedLocked: shouldLock ? true : state.lockState.isSimulatedLocked,
              lastUsageUpdateTimestamp: Date.now(),
            },
          };
        }),

      exitAppPenalty: () =>
        set((state) => ({
          lockState: {
            ...state.lockState,
            penaltiesCount: state.lockState.penaltiesCount + 1,
          },
        })),

      resetDailyStatsIfNeeded: () => {
        const today = new Date().toISOString().split('T')[0];
        const state = get();

        if (state.lockState.lastCheckDate !== today) {
          // If user had penalties yesterday, streak resets to 0.
          // If they successfully used the app (locked was active and completed without penalties), they keep/increment streak.
          let newStreak = state.lockState.streakDays;
          if (state.lockState.penaltiesCount > 0) {
            newStreak = 0;
          } else if (state.config.isEnabled && state.lockState.accumulatedUsageMinutes > 0) {
            newStreak += 1;
          }

          set(() => ({
            lockState: {
              ...state.lockState,
              accumulatedUsageMinutes: 0,
              penaltiesCount: 0,
              streakDays: newStreak,
              lastCheckDate: today,
              isSimulatedLocked: false, // Reset simulated lock on a new day
            },
          }));
        }
      },

      resetAll: () =>
        set(() => ({
          config: DEFAULT_CONFIG,
          lockState: DEFAULT_STATE,
        })),
    }),
    {
      name: 'ataraxia-lock-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
