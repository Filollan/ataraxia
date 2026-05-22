export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
  mood?: string;
}

export interface AudioRecording {
  id: string;
  title: string;
  uri: string; // local file uri
  durationMs: number;
  fileSize?: number;
  createdAt: string; // ISO datetime string
}

export interface DrawingPath {
  points: { x: number; y: number }[];
  color: string;
  thickness: number;
}

export interface DrawingSketch {
  id: string;
  title: string;
  uri?: string; // local file uri of exported PNG image
  paths: DrawingPath[];
  createdAt: string; // ISO datetime string
}

export type CreationType = 'journal' | 'audio' | 'drawing';

export interface CreationStats {
  totalJournals: number;
  totalAudios: number;
  totalDrawings: number;
}
