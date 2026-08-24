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
    (v) =>
      v.lang &&
      (v.lang.startsWith("vi") ||
        v.name.toLowerCase().includes("vietnam") ||
        v.name.toLowerCase().includes("tiếng việt"))
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

  // 2. Fallback to default voice
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
        const pulse =
          (Math.sin(2 * Math.PI * 1.5 * t) > 0.8 ? 1 : 0) *
          Math.sin(2 * Math.PI * 110 * t) *
          0.15;
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
        const pluck =
          (Math.sin((2 * Math.PI * freq * i) / sampleRate) +
            Math.sin((4 * Math.PI * freq * i) / sampleRate) * 0.5) *
          env;
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
        const pad2 =
          Math.sin(2 * Math.PI * (77.78 + Math.cos(t * 0.2) * 1.5) * t) * 0.7;
        const shimmer =
          Math.sin(2 * Math.PI * 523.25 * t) * (0.02 + 0.02 * Math.sin(t * 2));
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
        const pink = (lastOut + 0.02 * white) / 1.02;
        lastOut = pink;
        left[i] = pink * 0.12;
        right[i] = (lastOut + 0.02 * (Math.random() * 2 - 1)) * 0.12;
      }
      break;
    }
    default:
      break;
  }

  return buffer;
}

/**
 * Applies DSP Audio Effects to an AudioBuffer
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
  const extraTail =
    effectType === "reverb" || effectType === "horror" ? sourceBuffer.sampleRate * 2 : 0;
  const offlineCtx = new OfflineCtx(
    sourceBuffer.numberOfChannels,
    sourceBuffer.length + extraTail,
    sourceBuffer.sampleRate
  );

  const sourceNode = offlineCtx.createBufferSource();
  sourceNode.buffer = sourceBuffer;

  let lastNode: AudioNode = sourceNode;

  switch (effectType) {
    case "studio": {
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
      const convolver = offlineCtx.createConvolver();
      const reverbLen = offlineCtx.sampleRate * 2.0;
      const impulse = offlineCtx.createBuffer(2, reverbLen, offlineCtx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = impulse.getChannelData(ch);
        for (let i = 0; i < reverbLen; i++) {
          const decay = Math.exp((-i / reverbLen) * 3.5);
          d[i] = (Math.random() * 2 - 1) * decay * 0.6;
        }
      }
      convolver.buffer = impulse;

      const wetGain = offlineCtx.createGain();
      wetGain.gain.value = 0.35;
      const dryGain = offlineCtx.createGain();
      dryGain.gain.value = 0.85;

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
      const highpass = offlineCtx.createBiquadFilter();
      highpass.type = "highpass";
      highpass.frequency.value = 450;

      const lowpass = offlineCtx.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.value = 3200;

      const midPeak = offlineCtx.createBiquadFilter();
      midPeak.type = "peaking";
      midPeak.frequency.value = 1500;
      midPeak.gain.value = 6;
      midPeak.Q.value = 2.0;

      lastNode.connect(highpass);
      highpass.connect(lowpass);
      lowpass.connect(midPeak);
      lastNode = midPeak;
      break;
    }
    case "robot": {
      // Ring modulation / Metallic robotic filter
      const waveShaper = offlineCtx.createWaveShaper();
      const n_samples = 44100;
      const curve = new Float32Array(n_samples);
      const deg = Math.PI / 180;
      for (let i = 0; i < n_samples; ++i) {
        const x = (i * 2) / n_samples - 1;
        curve[i] = ((3 + 20) * x * 20 * deg) / (Math.PI + 20 * Math.abs(x));
      }
      waveShaper.curve = curve;

      const peakFilter = offlineCtx.createBiquadFilter();
      peakFilter.type = "peaking";
      peakFilter.frequency.value = 1000;
      peakFilter.gain.value = 12;
      peakFilter.Q.value = 8;

      lastNode.connect(peakFilter);
      peakFilter.connect(waveShaper);
      lastNode = waveShaper;
      break;
    }
    case "bassboost": {
      const bass = offlineCtx.createBiquadFilter();
      bass.type = "lowshelf";
      bass.frequency.value = 180;
      bass.gain.value = 9.0;

      const comp = offlineCtx.createDynamicsCompressor();
      comp.threshold.value = -12;
      comp.ratio.value = 3;

      lastNode.connect(bass);
      bass.connect(comp);
      lastNode = comp;
      break;
    }
    case "asmr": {
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

  const normalizedBgmVol = (bgmVolume / 100) * 0.35; // Subtle music underneath voice

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
 * Convert Base64 string to ArrayBuffer in browser
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Synthesizes high quality Vietnamese speech via backend TTS API
 */
export async function fetchBackendTTSSpeech(
  text: string,
  character: VoiceCharacter,
  settings: AudioSettings
): Promise<AudioBuffer> {
  const ctx = getAudioContext();

  const response = await fetch("/api/tts/synthesize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      voiceId: character.id,
      speed: settings.speed,
      pitch: settings.pitch,
    }),
  });

  if (!response.ok) {
    throw new Error(`Server TTS API error: ${response.status}`);
  }

  const data = await response.json();
  if (!data.audioBase64) {
    throw new Error("Không nhận được dữ liệu âm thanh");
  }

  const arrayBuffer = base64ToArrayBuffer(data.audioBase64);
  const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);

  // Apply speed / pitch transformation if character or settings specify custom speed/pitch
  const effectiveSpeed = settings.speed * character.defaultSpeed;
  const effectivePitch = settings.pitch * character.defaultPitch;

  if (Math.abs(effectiveSpeed - 1.0) > 0.05 || Math.abs(effectivePitch - 1.0) > 0.05) {
    const OfflineCtx =
      window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
    const newLength = Math.max(1, Math.floor(decodedBuffer.length / effectiveSpeed));
    const offCtx = new OfflineCtx(
      decodedBuffer.numberOfChannels,
      newLength,
      decodedBuffer.sampleRate
    );

    const src = offCtx.createBufferSource();
    src.buffer = decodedBuffer;
    src.playbackRate.value = effectiveSpeed;

    // Pitch shifting modulation via detune cents
    if (Math.abs(effectivePitch - 1.0) > 0.05) {
      src.detune.value = Math.log2(effectivePitch) * 1200;
    }

    const gainNode = offCtx.createGain();
    gainNode.gain.value = settings.volume / 100;

    src.connect(gainNode);
    gainNode.connect(offCtx.destination);
    src.start(0);

    return await offCtx.startRendering();
  }

  return decodedBuffer;
}

/**
 * Fallback Web Audio harmonic formant synthesizer
 */
export async function fallbackSynthesizeBuffer(
  text: string,
  character: VoiceCharacter,
  settings: AudioSettings,
  onProgress?: (percent: number) => void
): Promise<AudioBuffer> {
  const ctx = getAudioContext();
  const sampleRate = ctx.sampleRate;

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const effectiveSpeed = settings.speed * character.defaultSpeed;
  const baseSeconds = Math.max(1.8, wordCount / 3.4 / effectiveSpeed);
  const totalSamples = Math.floor(sampleRate * (baseSeconds + 0.6));

  const effectivePitch = settings.pitch * character.defaultPitch;
  const baseFreq =
    character.gender === "female"
      ? 240 * effectivePitch
      : character.gender === "neutral"
      ? 200 * effectivePitch
      : 130 * effectivePitch;

  const buffer = ctx.createBuffer(2, totalSamples, sampleRate);
  const channelLeft = buffer.getChannelData(0);
  const channelRight = buffer.getChannelData(1);

  const words = text.split(/\s+/).filter(Boolean);
  const samplesPerWord = totalSamples / Math.max(1, words.length);

  for (let w = 0; w < words.length; w++) {
    const word = words[w];
    const startSample = Math.floor(w * samplesPerWord);
    const endSample = Math.floor(Math.min(totalSamples, (w + 1) * samplesPerWord));
    const wordLen = endSample - startSample;

    let pitchMod = 1.0;
    if (/[áéíóúýắấếốớứ]/.test(word)) pitchMod = 1.14;
    else if (/[àèìòùỳằầềồờừ]/.test(word)) pitchMod = 0.88;
    else if (/[ảẻỉỏủỷẳẩểổởử]/.test(word)) pitchMod = 0.94;
    else if (/[ãẽĩõũỹẵẫễỗỡữ]/.test(word)) pitchMod = 1.08;
    else if (/[ạẹịọụỵặậệộợự]/.test(word)) pitchMod = 0.82;

    const curFreq = baseFreq * pitchMod;

    for (let i = startSample; i < endSample; i++) {
      const posInWord = (i - startSample) / Math.max(1, wordLen);
      const env = Math.sin(posInWord * Math.PI) * Math.min(1, (1 - posInWord) * 4);
      const t = i / sampleRate;
      const f0 = Math.sin(2 * Math.PI * curFreq * t);
      const f1 = Math.sin(2 * Math.PI * curFreq * 2.1 * t) * 0.45;
      const f2 = Math.sin(2 * Math.PI * curFreq * 3.4 * t) * 0.25;
      const f3 = Math.sin(2 * Math.PI * curFreq * 4.8 * t) * 0.12;
      const breath = (Math.random() * 2 - 1) * 0.04;

      const sampleVal =
        (f0 + f1 + f2 + f3 + breath) * env * 0.4 * (settings.volume / 100);

      channelLeft[i] = sampleVal;
      channelRight[i] = sampleVal * 0.98;
    }

    if (onProgress && w % 3 === 0) {
      onProgress(Math.floor((w / words.length) * 60));
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
  onProgress?.(20, "Đang xử lý ngữ điệu và phát âm chuẩn tiếng Việt...");

  let rawSpeechBuffer: AudioBuffer;
  try {
    rawSpeechBuffer = await fetchBackendTTSSpeech(text, character, settings);
  } catch (err) {
    console.warn("Backend TTS failed, using fallback engine:", err);
    onProgress?.(35, "Đang tổng hợp âm phổ nhân vật...");
    rawSpeechBuffer = await fallbackSynthesizeBuffer(text, character, settings);
  }

  onProgress?.(60, "Đang áp dụng bộ lọc âm thanh DSP Studio...");
  const effectiveEffect =
    settings.effect !== "none" ? settings.effect : character.effect || "none";
  const processedSpeechBuffer = await applyAudioEffect(
    rawSpeechBuffer,
    effectiveEffect
  );

  onProgress?.(80, "Đang hòa trộn nhạc nền (BGM)...");
  const ctx = getAudioContext();
  let bgmBuffer: AudioBuffer | null = null;
  if (settings.bgmId && settings.bgmId !== "none") {
    const bgmTrack = BGM_TRACKS.find((b) => b.id === settings.bgmId);
    if (bgmTrack) {
      bgmBuffer = generateBgmBuffer(
        ctx,
        bgmTrack.synthPreset,
        processedSpeechBuffer.duration
      );
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
  const fileSizeKB = Math.max(1, Math.round(exportBlob.size / 1024));

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
export async function playVoicePreview(character: VoiceCharacter): Promise<void> {
  const sampleText = character.sampleText || `Xin chào, tôi là ${character.name}.`;

  try {
    const previewSettings: AudioSettings = {
      voiceId: character.id,
      speed: character.defaultSpeed || 1.0,
      pitch: character.defaultPitch || 1.0,
      volume: 100,
      effect: character.effect || "none",
      bgmId: "none",
      bgmVolume: 0,
      exportFormat: "mp3",
    };

    const buffer = await fetchBackendTTSSpeech(sampleText, character, previewSettings);
    const ctx = getAudioContext();
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
  } catch {
    // Fallback to browser speech synthesis
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(sampleText);
      utterance.rate = character.defaultSpeed || 1.0;
      utterance.pitch = character.defaultPitch || 1.0;
      utterance.lang = "vi-VN";

      getBrowserVoices().then((voices) => {
        const matched = findBestVoice(character, voices);
        if (matched) utterance.voice = matched;
        window.speechSynthesis.speak(utterance);
      });
    }
  }
}
