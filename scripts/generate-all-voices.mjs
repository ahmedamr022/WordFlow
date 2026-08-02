import fs from "fs";
import path from "path";
import https from "https";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID_LAURA = "EXAVITQu4vr4xnSDxMaL"; // Valid ElevenLabs premade voice (Bella)

if (!ELEVENLABS_API_KEY) {
  console.error("❌ ELEVENLABS_API_KEY is required in environment variables.");
  process.exit(1);
}

// Simple text safe sanitizer
const sanitize = (str) => str.trim().replace(/[^a-z0-9]/gi, "_").toLowerCase();

// Directory targets
const baseAudioDir = path.join(__dirname, "../public/audio/voice_laura");
const wordsDir = path.join(baseAudioDir, "words");
const sentencesDir = path.join(baseAudioDir, "sentences/vocab");

fs.mkdirSync(wordsDir, { recursive: true });
fs.mkdirSync(sentencesDir, { recursive: true });

async function generateSpeech(text, outputPath) {
  if (fs.existsSync(outputPath)) {
    console.log(`⏩ Skipped existing: ${outputPath}`);
    return true;
  }

  const postData = JSON.stringify({
    text: text,
    model_id: "eleven_multilingual_v2",
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75,
    },
  });

  const options = {
    hostname: "api.elevenlabs.io",
    port: 443,
    path: `/v1/text-to-speech/${VOICE_ID_LAURA}`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": ELEVENLABS_API_KEY,
      "Content-Length": Buffer.byteLength(postData),
    },
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      if (res.statusCode !== 200) {
        let errData = "";
        res.on("data", (chunk) => { errData += chunk; });
        res.on("end", () => {
          console.error(`❌ HTTP Error ${res.statusCode} for "${text}": ${errData}`);
          resolve(false);
        });
        return;
      }

      const writeStream = fs.createWriteStream(outputPath);
      res.pipe(writeStream);
      writeStream.on("finish", () => {
        console.log(`✅ Saved MP3: ${outputPath}`);
        resolve(true);
      });
    });

    req.on("error", (e) => {
      console.error(`❌ Request Error for "${text}":`, e.message);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log("🎙️ Starting Audio Generator for Clean Unique Vocabulary...");
  
  // Read vocabularyData.ts content manually or parse words
  const vocabFileContent = fs.readFileSync(path.join(__dirname, "../src/data/vocabularyData.ts"), "utf-8");
  
  // Extract word: "..." and exampleEn: "..."
  const wordMatches = [...vocabFileContent.matchAll(/word:\s*"([^"]+)"/g)].map(m => m[1]);
  const sentenceMatches = [...vocabFileContent.matchAll(/exampleEn:\s*"([^"]+)"/g)].map(m => m[1]);

  console.log(`📌 Found ${wordMatches.length} unique words and ${sentenceMatches.length} sentences to check/generate.`);

  for (const w of wordMatches) {
    const safeW = sanitize(w);
    const wordPath = path.join(wordsDir, `${safeW}.mp3`);
    const success = await generateSpeech(w, wordPath);
    if (success === false && !fs.existsSync(wordPath)) {
      console.log("⏸️ Stopping generation loop due to quota limits.");
      break;
    }
  }

  for (const s of sentenceMatches) {
    const safeS = sanitize(s);
    const sentencePath = path.join(sentencesDir, `${safeS}.mp3`);
    const success = await generateSpeech(s, sentencePath);
    if (success === false && !fs.existsSync(sentencePath)) {
      console.log("⏸️ Stopping sentence generation loop due to quota limits.");
      break;
    }
  }

  console.log("🎉 Audio Generator script finished.");
}

run();
