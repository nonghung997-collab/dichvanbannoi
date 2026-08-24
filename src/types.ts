export type VoiceCategory =
  | "all"
  | "bac"
  | "nam"
  | "trung"
  | "character"
  | "special"
  | "trending";

export type AudioEffectType =
  | "none"
  | "studio"
  | "reverb"
  | "radio"
  | "robot"
  | "bassboost"
  | "asmr"
  | "horror"
  | "telephone";

export interface VoiceCharacter {
  id: string;
  name: string;
  avatar: string;
  gender: "male" | "female" | "neutral";
  region: "bac" | "nam" | "trung" | "anime" | "digital";
  category: VoiceCategory[];
  title: string;
  tag: string;
  description: string;
  sampleText: string;
  defaultPitch: number;
  defaultSpeed: number;
  effect?: AudioEffectType;
  popularBadge?: string;
  color: string;
}

export interface BgmTrack {
  id: string;
  name: string;
  category: string;
  mood: string;
  icon: string;
  synthPreset: "chill" | "cinematic" | "upbeat" | "mystery" | "piano" | "rain" | "lofi";
}

export interface AudioSettings {
  voiceId: string;
  speed: number;
  pitch: number;
  volume: number;
  effect: AudioEffectType;
  bgmId: string;
  bgmVolume: number;
  exportFormat: "mp3" | "wav";
}

export interface GeneratedAudioItem {
  id: string;
  title: string;
  text: string;
  voiceId: string;
  voiceName: string;
  voiceAvatar: string;
  voiceTitle: string;
  duration: number;
  audioBlobUrl: string;
  format: "mp3" | "wav";
  fileSizeKB: number;
  createdAt: number;
  settings: AudioSettings;
}

export interface DialogueLine {
  id: string;
  speaker: string;
  voiceId: string;
  text: string;
  speed?: number;
  pitch?: number;
}
