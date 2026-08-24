import { GeneratedAudioItem } from "../types";
import { audioBufferToMp3Blob, audioBufferToWavBlob } from "./mp3Encoder";
import { getAudioContext } from "./audioEngine";

export function triggerFileDownload(url: string, filename: string): void {
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
  }, 200);
}

export async function downloadAudioItem(
  item: GeneratedAudioItem,
  targetFormat: "mp3" | "wav" = "mp3"
): Promise<void> {
  const cleanTitle = (item.title || "VietVoice")
    .replace(/[^a-zA-Z0-9_À-ỹ]/g, "_")
    .substring(0, 25);
  const cleanVoice = (item.voiceName || "speech").replace(/[^a-zA-Z0-9_À-ỹ]/g, "_");
  const filename = `${cleanTitle || "VietVoice"}_${cleanVoice}_${Date.now()}.${targetFormat}`;

  try {
    if (item.format === targetFormat) {
      triggerFileDownload(item.audioBlobUrl, filename);
    } else {
      const response = await fetch(item.audioBlobUrl);
      const arrayBuf = await response.arrayBuffer();
      const ctx = getAudioContext();
      const decodedBuffer = await ctx.decodeAudioData(arrayBuf);

      let newBlob: Blob;
      if (targetFormat === "wav") {
        newBlob = audioBufferToWavBlob(decodedBuffer);
      } else {
        newBlob = audioBufferToMp3Blob(decodedBuffer, 192);
      }

      const tempUrl = URL.createObjectURL(newBlob);
      triggerFileDownload(tempUrl, filename);
      setTimeout(() => URL.revokeObjectURL(tempUrl), 30000);
    }
  } catch (err) {
    console.error("Lỗi khi tải file:", err);
    triggerFileDownload(item.audioBlobUrl, `${cleanTitle || "VietVoice"}.${item.format}`);
  }
}
