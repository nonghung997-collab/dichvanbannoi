import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "20mb" }));

  // API Route: Health Check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // Helper to split long Vietnamese text into safe TTS chunks
  function splitTextIntoTTSChunks(text: string, maxChunkLen: number = 140): string[] {
    const cleanText = text.trim();
    if (!cleanText) return [];

    // Split by major sentence delimiters
    const sentences = cleanText.split(/([.\n!?;]+)/);
    const combinedSentences: string[] = [];

    for (let i = 0; i < sentences.length; i += 2) {
      const sentence = (sentences[i] || "") + (sentences[i + 1] || "");
      if (sentence.trim()) {
        combinedSentences.push(sentence.trim());
      }
    }

    const chunks: string[] = [];
    let currentChunk = "";

    for (const sent of combinedSentences) {
      if (sent.length > maxChunkLen) {
        // Subsplit long sentences by comma or space
        const words = sent.split(/([,，\s]+)/);
        for (const w of words) {
          if ((currentChunk + w).length > maxChunkLen && currentChunk.trim()) {
            chunks.push(currentChunk.trim());
            currentChunk = w;
          } else {
            currentChunk += w;
          }
        }
      } else {
        if ((currentChunk + " " + sent).length > maxChunkLen && currentChunk.trim()) {
          chunks.push(currentChunk.trim());
          currentChunk = sent;
        } else {
          currentChunk = currentChunk ? currentChunk + " " + sent : sent;
        }
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks.length > 0 ? chunks : [cleanText.substring(0, maxChunkLen)];
  }

  // API Route: Vietnamese High-Fidelity TTS Synthesis
  app.post("/api/tts/synthesize", async (req, res) => {
    try {
      const { text, speed = 1.0, pitch = 1.0 } = req.body;
      if (!text || typeof text !== "string" || !text.trim()) {
        return res.status(400).json({ error: "Văn bản không được để trống" });
      }

      const chunks = splitTextIntoTTSChunks(text, 140);
      const audioBuffers: Buffer[] = [];

      for (const chunk of chunks) {
        if (!chunk.trim()) continue;
        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
          chunk.trim()
        )}&tl=vi&client=tw-ob`;

        const response = await fetch(ttsUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Referer: "https://translate.google.com/",
          },
        });

        if (!response.ok) {
          console.warn(`TTS fetch failed for chunk: "${chunk}", status: ${response.status}`);
          continue;
        }

        const arrayBuf = await response.arrayBuffer();
        audioBuffers.push(Buffer.from(arrayBuf));
      }

      if (audioBuffers.length === 0) {
        return res.status(500).json({ error: "Không thể tạo âm thanh từ văn bản này" });
      }

      const mergedAudio = Buffer.concat(audioBuffers);
      const audioBase64 = mergedAudio.toString("base64");

      return res.json({
        audioBase64,
        format: "mp3",
        sizeBytes: mergedAudio.length,
        chunkCount: audioBuffers.length,
      });
    } catch (error: any) {
      console.error("Lỗi API TTS Synthesize:", error);
      return res.status(500).json({ error: error.message || "Lỗi tạo giọng nói" });
    }
  });

  // API Route: Enhance & Optimize Vietnamese Script for TTS
  app.post("/api/ai/enhance-script", async (req, res) => {
    try {
      const { text, mode = "natural" } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Văn bản không được để trống" });
      }

      const ai = getAIClient();
      if (!ai) {
        // Return structured fallback if API key is not yet set
        return res.json({
          enhancedText: text,
          message: "Sử dụng kịch bản gốc (Đã sẵn sàng tạo giọng)",
        });
      }

      let instruction = "";
      switch (mode) {
        case "tiktok":
          instruction =
            "Hãy viết lại văn bản sau theo phong cách kịch bản TikTok/Reels/Shorts cực kỳ hấp dẫn, câu mở đầu giật tít thu hút người xem trong 3 giây đầu, nhịp điệu nhanh, thêm dấu phẩy và chấm để ngắt nghỉ hợp lý khi đọc bằng giọng AI. Giữ nguyên ý chính bằng tiếng Việt.";
          break;
        case "story":
          instruction =
            "Hãy trau chuốt văn bản sau thành một kịch bản kể chuyện truyền cảm, sâu lắng, huyền bí hoặc ấm áp. Thêm các dấu chấm lửng (...), dấu phẩy ở vị trí thích hợp để giọng đọc AI ngắt nghỉ đúng nhịp cảm xúc. Không thay đổi nội dung cốt lõi.";
          break;
        case "news":
          instruction =
            "Hãy chuẩn hóa văn bản sau thành phong cách bản tin thời sự truyền hình trang trọng, phát âm chuẩn, gãy gọn, dõng dạc, mạch lạc.";
          break;
        case "sales":
          instruction =
            "Hãy biến đổi đoạn văn bản này thành lời thoại bán hàng / quảng cáo livestream cực kỳ sôi động, kích thích chốt đơn, dứt khoát và cuốn hút.";
          break;
        case "punctuations":
        default:
          instruction =
            "Nhiệm vụ: Tối ưu hóa văn bản tiếng Việt để đọc bằng Text-To-Speech (TTS) mượt mà nhất. Thêm dấu ngắt nghỉ (phẩy, chấm, chấm lửng) chính xác, sửa lỗi chính tả và phát âm viết tắt (ví dụ: 'ko' -> 'không', 'đc' -> 'được', 'vs' -> 'với', các số hoặc từ viết tắt thành chữ phiên âm dễ đọc). Giữ nguyên toàn bộ nội dung.";
          break;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: `${instruction}\n\nVăn bản gốc:\n"""${text}"""\n\nChỉ trả về trực tiếp đoạn văn bản tiếng Việt đã được tối ưu hóa, không kèm lời giải thích hay ngoặc kép thừa.`,
      });

      const enhancedText = response.text?.trim() || text;
      return res.json({ enhancedText });
    } catch (error: any) {
      console.error("Lỗi enhance script:", error);
      return res.status(500).json({ error: error.message || "Lỗi xử lý kịch bản" });
    }
  });

  // API Route: AI Voice Suggester
  app.post("/api/ai/suggest-voice", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Văn bản không hợp lệ" });
      }

      const ai = getAIClient();
      if (!ai) {
        return res.json({
          recommendedVoiceId: "hn_news_female",
          reason: "Giọng đọc chuẩn truyền cảm",
          suggestedBgm: "podcast_chill",
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: `Phân tích đoạn văn bản sau và đề xuất phong cách giọng đọc phù hợp nhất trong các nhóm:
- "hn_news_female" (MC Thời sự Bắc nữ)
- "hn_news_male" (BTV Thời sự Bắc nam)
- "sg_tiktoker_female" (Reviewer Phim / TikToker sôi động)
- "sg_host_male" (Host Podcast Sài Gòn trẻ trung)
- "story_dark_male" (Kể chuyện đêm khuya / Truyện audio ma mị)
- "hue_poetic_female" (Giọng Huế thơ mộng trữ tình)
- "anime_mascot" (Hoạt hình nhí nhảnh vui nhộn)
- "robot_cyber" (Robot công nghệ AI)
- "sales_live_female" (Livestream chốt đơn hào hứng)

Văn bản: "${text.substring(0, 500)}"

Trả về dạng JSON với schema:
{
  "voiceId": "string",
  "genre": "string (ví dụ: Thời sự, Kể chuyện, TikTok, Bán hàng, Hoạt hình)",
  "suggestedBgm": "string (ví dụ: chill, cinematic, upbeat, horror, lofi)",
  "speed": number (0.8 đến 1.3),
  "pitch": number (0.8 đến 1.3),
  "reason": "string (ngắn gọn dưới 15 từ bằng tiếng Việt)"
}`,
        config: {
          responseMimeType: "application/json",
        },
      });

      let parsed = {};
      try {
        parsed = JSON.parse(response.text || "{}");
      } catch {
        parsed = {
          voiceId: "hn_news_female",
          genre: "Thời sự / Truyền cảm",
          suggestedBgm: "chill",
          speed: 1.0,
          pitch: 1.0,
          reason: "Phù hợp với nội dung thông tin",
        };
      }

      return res.json(parsed);
    } catch (error: any) {
      console.error("Lỗi suggest voice:", error);
      return res.json({
        voiceId: "hn_news_female",
        genre: "Chuẩn tiếng Việt",
        suggestedBgm: "chill",
        speed: 1.0,
        pitch: 1.0,
        reason: "Tự động phân tích mặc định",
      });
    }
  });

  // API Route: AI Dialogue Splitter (For multi-character conversations)
  app.post("/api/ai/dialogue-split", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Thiếu văn bản" });
      }

      const ai = getAIClient();
      if (!ai) {
        // Simple fallback splitting by line
        const lines = text.split("\n").filter((l: string) => l.trim().length > 0);
        const dialogues = lines.map((line: string, idx: number) => ({
          speaker: idx % 2 === 0 ? "Nhân vật A (Nam)" : "Nhân vật B (Nữ)",
          voiceId: idx % 2 === 0 ? "hn_news_male" : "sg_tiktoker_female",
          text: line.trim(),
        }));
        return res.json({ dialogues });
      }

      const prompt = `Phân tích đoạn văn sau và chia thành các câu thoại đối thoại giữa các nhân vật để lồng tiếng.
Đoạn văn:
"""${text}"""

Hãy trả về danh sách các câu thoại dạng JSON array. Mỗi item gồm:
- speaker: Tên nhân vật (ví dụ: Người dẫn chuyện, Nhân vật Nam, Cô Gái, v.v.)
- voiceId: Một trong các id gợi ý: ["hn_news_female", "hn_news_male", "sg_host_male", "sg_tiktoker_female", "story_dark_male", "anime_mascot", "elder_wise_male", "cute_baby"]
- text: Lời thoại của câu đó (tiếng Việt).

Trả về định dạng JSON thuần túy.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const dialogues = JSON.parse(response.text || "[]");
      return res.json({ dialogues });
    } catch (error: any) {
      console.error("Lỗi dialogue split:", error);
      return res.status(500).json({ error: "Không thể phân tách đối thoại" });
    }
  });

  // Vite middleware for development vs static production serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`VietVoice AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
