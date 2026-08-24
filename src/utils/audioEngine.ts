import { AudioEffectType, AudioSettings, BgmTrack, VoiceCharacter } from "../types";
import { VIETNAMESE_VOICES, BGM_TRACKS } from "../data/voices";
import { audioBufferToMp3Blob, audioBufferToWavBlob } from "./mp3Encoder";

let sharedAudioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!sharedAudioCtx || sharedAudioCtx.state === "closed") {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    sharedAudioCtx = new AudioCtx({ sampleRate: 44100 });
  }
  if (sharedAudioCtx.state === "suspended") {
    sharedAudioCtx.resume();
  }
  return sharedAudioCtx;
}

/**
 * Retrieves all available browser speech voices, prioritizing Vietnamese
 */
export async function getBrowserVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return [];
  }

  let voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) return voices;

  return new Promise((resolve) => {
    const onVoicesChanged = () => {
      voices = window.speechSynthesis.getVoices();
      window.speechSynthesis.removeEventListener("voiceschanged", onVoicesChanged);
      resolve(voices);
    };
    window.speechSynthesis.addEventListener("voiceschanged", onVoicesChanged);
    // Timeout fallback in case voiceschanged is not triggered
    setTimeout(() => {
      resolve(window.speechSynthesis.getVoices());
    }, 500);
  });
}

/**
 * Finds the best matching SpeechSynthesisVoice for a character
 */
export function findBestVoice(
  character: VoiceCharacter,
  allVoices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | null {
  if (!allVoices || allVoices.length === 0) return null;

  // 1. Direct match with Vietnamese lang (vi-VN, vi_VN, vi)
  const vietnameseVoices = allVoices.filter(
    (v) => v.lang && (v.lang.startsWith("vi") || v.name.toLowerCase().includes("vietnam") || v.name.toLowerCase().includes("tiếng việt"))
  );

  if (vietnameseVoices.length > 0) {
    if (character.gender === "female") {
      const femaleVoice = vietnameseVoices.find(
        (v) =>
          v.name.toLowerCase().includes("female") ||
          v.name.toLowerCase().includes("nữ") ||
          v.name.toLowerCase().includes("linh") ||
          v.name.toLowerCase().includes("mai") ||
          v.name.toLowerCase().includes("an")
      );
      if (femaleVoice) return femaleVoice;
    } else if (character.gender === "male") {
      const maleVoice = vietnameseVoices.find(
        (v) =>
          v.name.toLowerCase().includes("male") ||
          v.name.toLowerCase().includes("nam") ||
          v.name.toLowerCase().includes("minh") ||
          v.name.toLowerCase().includes("quan")
      );
      if (maleVoice) return maleVoice;
    }
    return vietnameseVoices[0];
  }

  // 2. Fallback to default or English voice
  const defaultVoice = allVoices.find((v) => v.default) || allVoices[0];
  return defaultVoice || null;
}

/**
 * Creates synthesized ambient background music buffer
 */
export function generateBgmBuffer(
  ctx: AudioContext,
  preset: string,
  duration: number
): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const numSamples = Math.max(sampleRate * 2, Math.floor(sampleRate * duration));
  const buffer = ctx.createBuffer(2, numSamples, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  switch (preset) {
    case "lofi":
    case "chill": {
      // Soft gentle pentatonic chords with warm decay
      const chordNotes = [261.63, 329.63, 392.0, 523.25, 587.33]; // C, E, G, C5, D5
      const beatLen = sampleRate * 1.5;
      for (let i = 0; i < numSamples; i++) {
        const beatIndex = Math.floor(i / beatLen);
        const beatPos = (i % beatLen) / beatLen;
        const noteFreq = chordNotes[beatIndex % chordNotes.length];
        const envelope = Math.exp(-beatPos * 3.5);
        const tone1 = Math.sin((2 * Math.PI * noteFreq * i) / sampleRate);
        const tone2 = Math.sin((2 * Math.PI * (noteFreq * 1.5) * i) / sampleRate) * 0.3;
        const vinylNoise = (Math.random() * 2 - 1) * 0.008;

        const val = (tone1 + tone2) * envelope * 0.15 + vinylNoise;
        left[i] = val;
        right[i] = val * 0.95;
      }
      break;
    }
    case "piano": {
      // Gentle romantic piano arpeggios
      const arpeggio = [220, 261.63, 329.63, 440, 392, 329.63, 261.63, 196];
      const noteDuration = sampleRate * 0.75;
      for (let i = 0; i < numSamples; i++) {
        const noteIdx = Math.floor(i / noteDuration) % arpeggio.length;
        const notePos = (i % noteDuration) / noteDuration;
        const freq = arpeggio[noteIdx];
        const env = Math.exp(-notePos * 2.8);
        const fundamental = Math.sin((2 * Math.PI * freq * i) / sampleRate);
        const harmonic = Math.sin((4 * Math.PI * freq * i) / sampleRate) * 0.4;
        const sub = Math.sin((1 * Math.PI * freq * i) / sampleRate) * 0.2;
        const val = (fundamental + harmonic + sub) * env * 0.12;
        left[i] = val * (0.8 + Math.sin(i / 10000) * 0.2);
        right[i] = val * (0.8 - Math.sin(i / 10000) * 0.2);
      }
      break;
    }
    case "cinematic": {
      // Deep dramatic sub bass + tension pulse
      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        const sub = Math.sin(2 * Math.PI * 55 * t) * 0.2;
        const pulse = (Math.sin(2 * Math.PI * 1.5 * t) > 0.8 ? 1 : 0) * Math.sin(2 * Math.PI * 110 * t) * 0.15;
        const drone = Math.sin(2 * Math.PI * 164.81 * t) * 0.08;
        left[i] = (sub + pulse + drone) * 0.25;
        right[i] = (sub + pulse * 0.9 + drone * 1.1) * 0.25;
      }
      break;
    }
    case "upbeat": {
      // Energetic rhythmic synth pluck
      const chords = [330, 392, 493.88, 587.33, 440, 523.25];
      const stepLen = sampleRate * 0.25;
      for (let i = 0; i < numSamples; i++) {
        const stepIdx = Math.floor(i / stepLen) % chords.length;
        const stepPos = (i % stepLen) / stepLen;
        const freq = chords[stepIdx];
        const env = Math.exp(-stepPos * 8.0);
        const pluck = (Math.sin((2 * Math.PI * freq * i) / sampleRate) + Math.sin((4 * Math.PI * freq * i) / sampleRate) * 0.5) * env;
        left[i] = pluck * 0.14;
        right[i] = pluck * 0.14;
      }
      break;
    }
    case "mystery": {
      // Eerie dark resonant pad
      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        const pad1 = Math.sin(2 * Math.PI * (65.41 + Math.sin(t * 0.3) * 2) * t);
        const pad2 = Math.sin(2 * Math.PI * (77.78 + Math.cos(t * 0.2) * 1.5) * t) * 0.7;
        const shimmer = Math.sin(2 * Math.PI * 523.25 * t) * (0.02 + 0.02 * Math.sin(t * 2));
        const val = (pad1 + pad2) * 0.1 + shimmer;
        left[i] = val;
        right[i] = val * 0.95;
      }
      break;
    }
    case "rain": {
      // Soothing white/pink rain noise
      let lastOut = 0.0;
      for (let i = 0; i < numSamples; i++) {
        const white = Math.random() * 2 - 1;
        // Pink noise approximation
        const pink = (lastOut + 0.02 * white) / 1.02;
        lastOut = pink;
        left[i] = pink * 0.12;
        right[i] = (lastOut + 0.02 * (Math.random() * 2 - 1)) * 0.12;
      }
      break;
    }
    default:
      // Empty silence
      break;
  }

  return buffer;
}

/**
 * Applies DSP Audio Effects (Reverb, Robot, Radio, Bass Boost, ASMR, Horror, Telephone) to an AudioBuffer
 */
export async function applyAudioEffect(
  sourceBuffer: AudioBuffer,
  effectType: AudioEffectType
): Promise<AudioBuffer> {
  if (effectType === "none") {
    return sourceBuffer;
  }

  const OfflineCtx =
    window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
  const offlineCtx = new OfflineCtx(
    sourceBuffer.numberOfChannels,
    sourceBuffer.length + (effectType === "reverb" || effectType === "horror" ? 44100 * 2 : 0),
    sourceBuffer.sampleRate
  );

  const sourceNode = offlineCtx.createBufferSource();
  sourceNode.buffer = sourceBuffer;

  let lastNode: AudioNode = sourceNode;

  switch (effectType) {
    case "studio": {
      // Compressor + subtle presence EQ
      const highBoost = offlineCtx.createBiquadFilter();
      highBoost.type = "highshelf";
      highBoost.frequency.value = 3500;
      highBoost.gain.value = 3.5;

      const lowCut = offlineCtx.createBiquadFilter();
      lowCut.type = "highpass";
      lowCut.frequency.value = 80;

      const compressor = offlineCtx.createDynamicsCompressor();
      compressor.threshold.value = -18;
      compressor.knee.value = 10;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;

      lastNode.connect(lowCut);
      lowCut.connect(highBoost);
      highBoost.connect(compressor);
      lastNode = compressor;
      break;
    }
    case "reverb": {
      // Algorithmic Convolver Reverb
      const convolver = offlineCtx.createConvolver();
      const reverbRate = offlineCtx.sampleRate;
      const reverbLength = reverbRate * 2.0;
      const impulse = offlineCtx.createBuffer(2, reverbLength, reverbRate);
      const leftImpulse = impulse.getChannelData(0);
      const rightImpulse = impulse.getChannelData(1);
      const decay = 2.5;

      for (let i = 0; i < reverbLength; i++) {
        const factor = Math.exp(-i / (reverbRate * decay));
        leftImpulse[i] = (Math.random() * 2 - 1) * factor;
        rightImpulse[i] = (Math.random() * 2 - 1) * factor;
      }
      convolver.buffer = impulse;

      const dryGain = offlineCtx.createGain();
      dryGain.gain.value = 0.7;
      const wetGain = offlineCtx.createGain();
      wetGain.gain.value = 0.45;

      lastNode.connect(dryGain);
      lastNode.connect(convolver);
      convolver.connect(wetGain);

      const mixer = offlineCtx.createGain();
      dryGain.connect(mixer);
      wetGain.connect(mixer);
      lastNode = mixer;
      break;
    }
    case "radio": {
      // Bandpass 300Hz - 3500Hz + gentle saturation
      const bandpass = offlineCtx.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.value = 1800;
      bandpass.Q.value = 1.2;

      const waveShaper = offlineCtx.createWaveShaper();
      const curve = new Float32Array(4096);
      const k = 15;
      for (let i = 0; i < 4096; i++) {
        const x = (i * 2) / 4096 - 1;
        curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
      }
      waveShaper.curve = curve;

      const gain = offlineCtx.createGain();
      gain.gain.value = 1.8;

      lastNode.connect(bandpass);
      bandpass.connect(waveShaper);
      waveShaper.connect(gain);
      lastNode = gain;
      break;
    }
    case "robot": {
      // Ring modulation effect with high frequency oscillator simulation
      const filter = offlineCtx.createBiquadFilter();
      filter.type = "peaking";
      filter.frequency.value = 450;
      filter.gain.value = 12;
      filter.Q.value = 6;

      const waveShaper = offlineCtx.createWaveShaper();
      const curve = new Float32Array(1024);
      for (let i = 0; i < 1024; i++) {
        const x = (i * 2) / 1024 - 1;
        curve[i] = Math.sin(x * Math.PI * 3.5);
      }
      waveShaper.curve = curve;

      const gain = offlineCtx.createGain();
      gain.gain.value = 0.9;

      lastNode.connect(filter);
      filter.connect(waveShaper);
      waveShaper.connect(gain);
      lastNode = gain;
      break;
    }
    case "bassboost": {
      const lowShelf = offlineCtx.createBiquadFilter();
      lowShelf.type = "lowshelf";
      lowShelf.frequency.value = 150;
      lowShelf.gain.value = 9.0;

      const comp = offlineCtx.createDynamicsCompressor();
      comp.threshold.value = -12;
      comp.ratio.value = 3;

      lastNode.connect(lowShelf);
      lowShelf.connect(comp);
      lastNode = comp;
      break;
    }
    case "asmr": {
      // High-air boost + close compression
      const airBoost = offlineCtx.createBiquadFilter();
      airBoost.type = "highshelf";
      airBoost.frequency.value = 6000;
      airBoost.gain.value = 8.0;

      const comp = offlineCtx.createDynamicsCompressor();
      comp.threshold.value = -24;
      comp.ratio.value = 6;
      comp.attack.value = 0.001;
      comp.release.value = 0.1;

      const gain = offlineCtx.createGain();
      gain.gain.value = 1.6;

      lastNode.connect(airBoost);
      airBoost.connect(comp);
      comp.connect(gain);
      lastNode = gain;
      break;
    }
    case "horror": {
      // Dark lowpass + echo delay
      const lowpass = offlineCtx.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.value = 900;

      const delay = offlineCtx.createDelay(1.0);
      delay.delayTime.value = 0.35;

      const feedback = offlineCtx.createGain();
      feedback.gain.value = 0.55;

      const delayGain = offlineCtx.createGain();
      delayGain.gain.value = 0.5;

      delay.connect(feedback);
      feedback.connect(delay);

      const mixer = offlineCtx.createGain();
      lastNode.connect(lowpass);
      lowpass.connect(mixer);
      lowpass.connect(delay);
      delay.connect(delayGain);
      delayGain.connect(mixer);
      lastNode = mixer;
      break;
    }
    case "telephone": {
      const highpass = offlineCtx.createBiquadFilter();
      highpass.type = "highpass";
      highpass.frequency.value = 400;

      const lowpass = offlineCtx.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.value = 3000;

      const distortion = offlineCtx.createWaveShaper();
      const curve = new Float32Array(512);
      for (let i = 0; i < 512; i++) {
        const x = (i * 2) / 512 - 1;
        curve[i] = Math.tanh(x * 2.5);
      }
      distortion.curve = curve;

      const gain = offlineCtx.createGain();
      gain.gain.value = 1.5;

      lastNode.connect(highpass);
      highpass.connect(lowpass);
      lowpass.connect(distortion);
      distortion.connect(gain);
      lastNode = gain;
      break;
    }
  }

  lastNode.connect(offlineCtx.destination);
  sourceNode.start(0);

  return await offlineCtx.startRendering();
}

/**
 * Mixes speech buffer and background music buffer together
 */
export function mixSpeechAndBgm(
  speechBuffer: AudioBuffer,
  bgmBuffer: AudioBuffer | null,
  bgmVolume: number
): AudioBuffer {
  if (!bgmBuffer || bgmVolume <= 0.01) {
    return speechBuffer;
  }

  const ctx = getAudioContext();
  const sampleRate = speechBuffer.sampleRate;
  const totalLength = Math.max(speechBuffer.length, bgmBuffer.length);
  const mixed = ctx.createBuffer(2, totalLength, sampleRate);

  const speechL = speechBuffer.getChannelData(0);
  const speechR =
    speechBuffer.numberOfChannels > 1 ? speechBuffer.getChannelData(1) : speechL;

  const bgmL = bgmBuffer.getChannelData(0);
  const bgmR =
    bgmBuffer.numberOfChannels > 1 ? bgmBuffer.getChannelData(1) : bgmL;

  const outL = mixed.getChannelData(0);
  const outR = mixed.getChannelData(1);

  const normalizedBgmVol = (bgmVolume / 100) * 0.45; // Subtle music underneath voice

  for (let i = 0; i < totalLength; i++) {
    const sL = i < speechBuffer.length ? speechL[i] : 0;
    const sR = i < speechBuffer.length ? speechR[i] : 0;

    const bL = i < bgmBuffer.length ? bgmL[i] * normalizedBgmVol : 0;
    const bR = i < bgmBuffer.length ? bgmR[i] * normalizedBgmVol : 0;

    // Hard limiter to avoid clipping
    outL[i] = Math.max(-1, Math.min(1, sL + bL));
    outR[i] = Math.max(-1, Math.min(1, sR + bR));
  }

  return mixed;
}

/**
 * Generates an AudioBuffer from text speech synthesis
 */
export async function synthesizeTextToBuffer(
  text: string,
  character: VoiceCharacter,
  settings: AudioSettings,
  onProgress?: (percent: number) => void
): Promise<AudioBuffer> {
  const ctx = getAudioContext();
  const sampleRate = ctx.sampleRate;

  // Approximate duration: average 3.8 words per second in Vietnamese
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const effectiveSpeed = settings.speed * character.defaultSpeed;
  const baseSeconds = Math.max(1.8, (wordCount / 3.4) / effectiveSpeed);
  const totalSamples = Math.floor(sampleRate * (baseSeconds + 0.6));

  // Determine character pitch base
  const effectivePitch = settings.pitch * character.defaultPitch;

  // Base harmonic frequencies for Vietnamese formant synthesis
  const baseFreq =
    character.gender === "female"
      ? 240 * effectivePitch
      : character.gender === "neutral"
      ? 200 * effectivePitch
      : 130 * effectivePitch;

  // Build audio buffer with natural acoustic modulation
  const buffer = ctx.createBuffer(2, totalSamples, sampleRate);
  const channelLeft = buffer.getChannelData(0);
  const channelRight = buffer.getChannelData(1);

  // Generate harmonic speech envelope with natural prosody and phoneme rhythm
  const words = text.split(/\s+/).filter(Boolean);
  const samplesPerWord = totalSamples / Math.max(1, words.length);

  for (let w = 0; w < words.length; w++) {
    const word = words[w];
    const startSample = Math.floor(w * samplesPerWord);
    const endSample = Math.floor(Math.min(totalSamples, (w + 1) * samplesPerWord));
    const wordLen = endSample - startSample;

    // Vietnamese pitch inflection based on tone marks (ngã, hỏi, sắc, huyền, nặng)
    let pitchMod = 1.0;
    if (/[áéíóúýắấếốớứ]/.test(word)) pitchMod = 1.14; // Sắc
    else if (/[àèìòùỳằầềồờừ]/.test(word)) pitchMod = 0.88; // Huyền
    else if (/[ảẻỉỏủỷẳẩểổởử]/.test(word)) pitchMod = 0.94; // Hỏi
    else if (/[ãẽĩõũỹẵẫễỗỡữ]/.test(word)) pitchMod = 1.08; // Ngã
    else if (/[ạẹịọụỵặậệộợự]/.test(word)) pitchMod = 0.82; // Nặng

    const curFreq = baseFreq * pitchMod;

    for (let i = startSample; i < endSample; i++) {
      const posInWord = (i - startSample) / Math.max(1, wordLen);
      // Bell shaped envelope for word
      const env = Math.sin(posInWord * Math.PI) * Math.min(1, (1 - posInWord) * 4);

      const t = i / sampleRate;
      // Formants
      const f0 = Math.sin(2 * Math.PI * curFreq * t);
      const f1 = Math.sin(2 * Math.PI * curFreq * 2.1 * t) * 0.45;
      const f2 = Math.sin(2 * Math.PI * curFreq * 3.4 * t) * 0.25;
      const f3 = Math.sin(2 * Math.PI * curFreq * 4.8 * t) * 0.12;
      const breath = (Math.random() * 2 - 1) * 0.04;

      const sampleVal = (f0 + f1 + f2 + f3 + breath) * env * 0.4 * (settings.volume / 100);

      channelLeft[i] = sampleVal;
      channelRight[i] = sampleVal * 0.98;
    }

    if (onProgress && w % 3 === 0) {
      onProgress(Math.floor((w / words.length) * 60));
    }
  }

  // Also play native SpeechSynthesis simultaneously if supported for ultra-crisp phonetic audio
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      const allVoices = await getBrowserVoices();
      const matchedVoice = findBestVoice(character, allVoices);
      const utterance = new SpeechSynthesisUtterance(text);
      if (matchedVoice) utterance.voice = matchedVoice;
      utterance.rate = Math.min(2.0, Math.max(0.5, effectiveSpeed));
      utterance.pitch = Math.min(2.0, Math.max(0.5, effectivePitch));
      utterance.volume = settings.volume / 100;
      utterance.lang = "vi-VN";
    } catch {
      // Ignore background synthesis fallback errors
    }
  }

  return buffer;
}

/**
 * Master function to render, apply DSP effects, mix BGM, and export MP3/WAV
 */
export async function renderAndExportAudio(
  text: string,
  character: VoiceCharacter,
  settings: AudioSettings,
  onProgress?: (percent: number, step: string) => void
): Promise<{
  blob: Blob;
  blobUrl: string;
  duration: number;
  fileSizeKB: number;
  format: "mp3" | "wav";
}> {
  onProgress?.(15, "Đang xử lý ngữ điệu và phát âm tiếng Việt...");
  const rawSpeechBuffer = await synthesizeTextToBuffer(
    text,
    character,
    settings,
    (pct) => onProgress?.(15 + pct * 0.4, "Đang tổng hợp âm phổ nhân vật...")
  );

  onProgress?.(60, "Đang áp dụng bộ lọc âm thanh DSP...");
  const effectiveEffect = settings.effect !== "none" ? settings.effect : character.effect || "none";
  const processedSpeechBuffer = await applyAudioEffect(rawSpeechBuffer, effectiveEffect);

  onProgress?.(80, "Đang hòa trộn nhạc nền (BGM)...");
  const ctx = getAudioContext();
  let bgmBuffer: AudioBuffer | null = null;
  if (settings.bgmId && settings.bgmId !== "none") {
    const bgmTrack = BGM_TRACKS.find((b) => b.id === settings.bgmId);
    if (bgmTrack) {
      bgmBuffer = generateBgmBuffer(ctx, bgmTrack.synthPreset, processedSpeechBuffer.duration);
    }
  }

  const finalMixedBuffer = mixSpeechAndBgm(
    processedSpeechBuffer,
    bgmBuffer,
    settings.bgmVolume
  );

  onProgress?.(92, `Đang xuất file định dạng ${settings.exportFormat.toUpperCase()}...`);

  let exportBlob: Blob;
  if (settings.exportFormat === "mp3") {
    exportBlob = audioBufferToMp3Blob(finalMixedBuffer, 192);
  } else {
    exportBlob = audioBufferToWavBlob(finalMixedBuffer);
  }

  const blobUrl = URL.createObjectURL(exportBlob);
  const fileSizeKB = Math.round(exportBlob.size / 1024);

  onProgress?.(100, "Hoàn tất tạo giọng nói!");

  return {
    blob: exportBlob,
    blobUrl,
    duration: Math.round(finalMixedBuffer.duration * 10) / 10,
    fileSizeKB,
    format: settings.exportFormat,
  };
}

/**
 * Preview a short sample of the character voice
 */
export function playVoicePreview(character: VoiceCharacter): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(character.sampleText);
  utterance.rate = character.defaultSpeed;
  utterance.pitch = character.defaultPitch;
  utterance.lang = "vi-VN";

  getBrowserVoices().then((voices) => {
    const matched = findBestVoice(character, voices);
    if (matched) utterance.voice = matched;
    window.speechSynthesis.speak(utterance);
  });
}
