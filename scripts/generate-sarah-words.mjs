import fs from "fs";
import path from "path";
import https from "https";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID_SARAH = "EXAVITQu4vr4xnSDxMaL";

if (!ELEVENLABS_API_KEY) {
  console.error("ELEVENLABS_API_KEY is required.");
  process.exit(1);
}

const sanitize = (str) => str.trim().replace(/[^a-z0-9]/gi, "_").toLowerCase();

const wordsDir = path.join(__dirname, "../public/audio/voice_sarah/words");
const sentencesBaseDir = path.join(__dirname, "../public/audio/voice_sarah/sentences");
fs.mkdirSync(wordsDir, { recursive: true });

// ============================================================
// ALL words from ALL sentences in stories.ts (extracted manually)
// ============================================================
const ALL_SENTENCES = [
  // === ready-to-learn ===
  { storyId: "ready-to-learn", lineId: 1, text: "I am ready to learn." },
  { storyId: "ready-to-learn", lineId: 2, text: "English is easy and fun." },
  { storyId: "ready-to-learn", lineId: 3, text: "Practice every single day." },
  { storyId: "ready-to-learn", lineId: 4, text: "Listen carefully to each word." },
  { storyId: "ready-to-learn", lineId: 5, text: "Your progress starts right now." },
  // === keep-going ===
  { storyId: "keep-going", lineId: 1, text: "Small steps bring big results." },
  { storyId: "keep-going", lineId: 2, text: "Never stop trying your best." },
  { storyId: "keep-going", lineId: 3, text: "You can achieve your goals." },
  { storyId: "keep-going", lineId: 4, text: "Trust yourself and move forward." },
  // === magic-bookshelf ===
  { storyId: "magic-bookshelf", lineId: 1, text: "Books open doors to new worlds." },
  { storyId: "magic-bookshelf", lineId: 2, text: "Read quietly every single evening." },
  { storyId: "magic-bookshelf", lineId: 3, text: "Knowledge is true inner power." },
  { storyId: "magic-bookshelf", lineId: 4, text: "Every page holds a new secret." },
  // === the-letter ===
  { storyId: "the-letter", lineId: 1, text: "She glanced at the letter on the table." },
  { storyId: "the-letter", lineId: 2, text: "It had arrived early that morning." },
  { storyId: "the-letter", lineId: 3, text: "Her hands trembled with quiet excitement." },
  { storyId: "the-letter", lineId: 4, text: "The ink carried words of hope." },
  // === night-in-cairo ===
  { storyId: "night-in-cairo", lineId: 1, text: "The Nile river sparkled under the stars." },
  { storyId: "night-in-cairo", lineId: 2, text: "Warm breeze filled the ancient city streets." },
  { storyId: "night-in-cairo", lineId: 3, text: "Every corner whispered stories of long past." },
  { storyId: "night-in-cairo", lineId: 4, text: "Lights danced beautifully upon the water." },
  // === titanic-legend ===
  { storyId: "titanic-legend", lineId: 1, text: "The giant ship sailed across the cold ocean." },
  { storyId: "titanic-legend", lineId: 2, text: "Passengers admired the elegant grand design." },
  { storyId: "titanic-legend", lineId: 3, text: "Music echoed softly through the dining halls." },
  { storyId: "titanic-legend", lineId: 4, text: "A sudden iceberg emerged in dark waters." },
  { storyId: "titanic-legend", lineId: 5, text: "Brave souls stood together until the end." },
  { storyId: "titanic-legend", lineId: 6, text: "Its memory lives forever in human history." },
];

// Extract ALL unique words from all sentences
const allWords = new Set();
ALL_SENTENCES.forEach(s => {
  s.text.replace(/[.,!?;:'"]/g, "").split(/\s+/).forEach(w => {
    if (w.trim()) allWords.add(w.toLowerCase());
  });
});

const uniqueWords = [...allWords];

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateSpeech(text, outputPath) {
  if (fs.existsSync(outputPath)) {
    console.log(`⏩ Exists: ${path.basename(outputPath)}`);
    return "skipped";
  }

  const postData = JSON.stringify({
    text: text,
    model_id: "eleven_multilingual_v2",
    voice_settings: {
      stability: 0.85,
      similarity_boost: 0.85,
      style: 0.10,
      use_speaker_boost: true,
    },
  });

  const options = {
    hostname: "api.elevenlabs.io",
    port: 443,
    path: `/v1/text-to-speech/${VOICE_ID_SARAH}`,
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
          console.error(`❌ HTTP ${res.statusCode} for "${text}": ${errData.substring(0, 200)}`);
          resolve("failed");
        });
        return;
      }

      const writeStream = fs.createWriteStream(outputPath);
      res.pipe(writeStream);
      writeStream.on("finish", () => {
        console.log(`✅ Generated: ${path.basename(outputPath)} (${text})`);
        resolve("generated");
      });
    });

    req.on("error", (e) => {
      console.error(`❌ Error for "${text}":`, e.message);
      resolve("failed");
    });

    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log("=".repeat(60));
  console.log("  WordFlow - ElevenLabs Voice Generator (voice_sarah)");
  console.log("  Voice: Sarah | Stability: 0.85 | Style: 0.10 (calm)");
  console.log("=".repeat(60));

  let generated = 0, skipped = 0, failed = 0, consecutiveFails = 0;

  // ===== PHASE 1: Generate individual word files =====
  console.log(`\n📖 Phase 1: Generating ${uniqueWords.length} word files...\n`);

  for (const word of uniqueWords) {
    const safeWord = sanitize(word);
    const wordPath = path.join(wordsDir, `${safeWord}.mp3`);
    const result = await generateSpeech(word, wordPath);

    if (result === "skipped") { skipped++; consecutiveFails = 0; }
    else if (result === "generated") { generated++; consecutiveFails = 0; await delay(300); }
    else { failed++; consecutiveFails++; }

    if (consecutiveFails >= 3) {
      console.log("\n⏸️ Stopping words — quota may be exhausted.");
      break;
    }
  }

  // ===== PHASE 2: Generate sentence line files =====
  consecutiveFails = 0;
  console.log(`\n🔊 Phase 2: Generating ${ALL_SENTENCES.length} sentence line files...\n`);

  for (const s of ALL_SENTENCES) {
    const storyDir = path.join(sentencesBaseDir, s.storyId);
    fs.mkdirSync(storyDir, { recursive: true });
    const linePath = path.join(storyDir, `line_${s.lineId}.mp3`);
    const result = await generateSpeech(s.text, linePath);

    if (result === "skipped") { skipped++; consecutiveFails = 0; }
    else if (result === "generated") { generated++; consecutiveFails = 0; await delay(300); }
    else { failed++; consecutiveFails++; }

    if (consecutiveFails >= 3) {
      console.log("\n⏸️ Stopping sentences — quota may be exhausted.");
      break;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`  ✅ Generated: ${generated} | ⏩ Skipped: ${skipped} | ❌ Failed: ${failed}`);
  console.log("=".repeat(60));
}

run();
