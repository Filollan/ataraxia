import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JournalEntry, AudioRecording, DrawingSketch, CreationStats } from '../types';

interface CreationsStore {
  journals: JournalEntry[];
  audios: AudioRecording[];
  drawings: DrawingSketch[];

  addJournal: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateJournal: (id: string, entry: Partial<Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteJournal: (id: string) => void;

  addAudio: (recording: Omit<AudioRecording, 'id' | 'createdAt'>) => void;
  deleteAudio: (id: string) => void;

  addDrawing: (sketch: Omit<DrawingSketch, 'id' | 'createdAt'>) => void;
  deleteDrawing: (id: string) => void;

  getStats: () => CreationStats;
  resetAll: () => void;
}

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2, 9);

export const useCreationsStore = create<CreationsStore>()(
  persist(
    (set, get) => ({
      journals: [],
      audios: [],
      drawings: [],

      addJournal: (entry) =>
        set((state) => {
          const now = new Date().toISOString();
          const newJournal: JournalEntry = {
            ...entry,
            id: generateId(),
            createdAt: now,
            updatedAt: now,
          };
          return { journals: [newJournal, ...state.journals] };
        }),

      updateJournal: (id, updates) =>
        set((state) => ({
          journals: state.journals.map((j) =>
            j.id === id
              ? { ...j, ...updates, updatedAt: new Date().toISOString() }
              : j
          ),
        })),

      deleteJournal: (id) =>
        set((state) => ({
          journals: state.journals.filter((j) => j.id !== id),
        })),

      addAudio: (recording) =>
        set((state) => {
          const newAudio: AudioRecording = {
            ...recording,
            id: generateId(),
            createdAt: new Date().toISOString(),
          };
          return { audios: [newAudio, ...state.audios] };
        }),

      deleteAudio: (id) =>
        set((state) => ({
          audios: state.audios.filter((a) => a.id !== id),
        })),

      addDrawing: (sketch) =>
        set((state) => {
          const newDrawing: DrawingSketch = {
            ...sketch,
            id: generateId(),
            createdAt: new Date().toISOString(),
          };
          return { drawings: [newDrawing, ...state.drawings] };
        }),

      deleteDrawing: (id) =>
        set((state) => ({
          drawings: state.drawings.filter((d) => d.id !== id),
        })),

      getStats: () => {
        const state = get();
        return {
          totalJournals: state.journals.length,
          totalAudios: state.audios.length,
          totalDrawings: state.drawings.length,
        };
      },

      resetAll: () =>
        set(() => ({
          journals: [],
          audios: [],
          drawings: [],
        })),
    }),
    {
      name: 'ataraxia-creations-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
