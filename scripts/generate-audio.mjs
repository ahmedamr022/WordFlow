/**
 * WordFlow Dual Voice ElevenLabs Audio Generator Script
 * Creates two independent voice folders:
 *  1. public/audio/voice_sarah/ (Natural Fast American Female)
 *  2. public/audio/voice_laura/ (Calm Educational American Female)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "sk_c816b205a009ad3b3fdf88e1e57ef29d37f3a2b60a6b2a8a";
const MODEL_ID = "eleven_flash_v2_5";
const BASE_OUTPUT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "audio");
const DELAY_BETWEEN_REQUESTS_MS = 400;

const VOICES = [
  { id: "EXAVITQu4vr4xnSDxMaL", folder: "voice_sarah", name: "Sarah (Natural Fast)" },
  { id: "FGY2WhTYpPnrIDTdsKH5", folder: "voice_laura", name: "Laura (Calm Educational)" },
];

const ALL_STORIES = [
  {
    id: "ready-to-learn",
    lines: [
      { id: 1, text: "I am ready to learn.", words: ["I", "am", "ready", "to", "learn"] },
      { id: 2, text: "English is easy and fun.", words: ["English", "is", "easy", "and", "fun"] },
      { id: 3, text: "Practice every single day.", words: ["Practice", "every", "single", "day"] },
      { id: 4, text: "Listen carefully to each word.", words: ["Listen", "carefully", "to", "each", "word"] },
      { id: 5, text: "Your progress starts right now.", words: ["Your", "progress", "starts", "right", "now"] },
    ],
  },
  {
    id: "keep-going",
    lines: [
      { id: 1, text: "Small steps bring big results.", words: ["Small", "steps", "bring", "big", "results"] },
      { id: 2, text: "Never stop trying your best.", words: ["Never", "stop", "trying", "your", "best"] },
      { id: 3, text: "You can achieve your goals.", words: ["You", "can", "achieve", "your", "goals"] },
      { id: 4, text: "Trust yourself and move forward.", words: ["Trust", "yourself", "and", "move", "forward"] },
    ],
  },
  {
    id: "magic-bookshelf",
    lines: [
      { id: 1, text: "Books open doors to new worlds.", words: ["Books", "open", "doors", "to", "new", "worlds"] },
      { id: 2, text: "Read quietly every single evening.", words: ["Read", "quietly", "every", "single", "evening"] },
      { id: 3, text: "Knowledge is true inner power.", words: ["Knowledge", "is", "true", "inner", "power"] },
      { id: 4, text: "Every page holds a new secret.", words: ["Every", "page", "holds", "a", "new", "secret"] },
    ],
  },
  {
    id: "the-letter",
    lines: [
      { id: 1, text: "She glanced at the letter on the table.", words: ["She", "glanced", "at", "the", "letter", "on", "the", "table"] },
      { id: 2, text: "It had arrived early that morning.", words: ["It", "had", "arrived", "early", "that", "morning"] },
      { id: 3, text: "Her hands trembled with quiet excitement.", words: ["Her", "hands", "trembled", "with", "quiet", "excitement"] },
      { id: 4, text: "The ink carried words of hope.", words: ["The", "ink", "carried", "words", "of", "hope"] },
    ],
  },
  {
    id: "night-in-cairo",
    lines: [
      { id: 1, text: "The Nile river sparkled under the stars.", words: ["The", "Nile", "river", "sparkled", "under", "the", "stars"] },
      { id: 2, text: "Warm breeze filled the ancient city streets.", words: ["Warm", "breeze", "filled", "the", "ancient", "city", "streets"] },
      { id: 3, text: "Every corner whispered stories of long past.", words: ["Every", "corner", "whispered", "stories", "of", "long", "past"] },
      { id: 4, text: "Lights danced beautifully upon the water.", words: ["Lights", "danced", "beautifully", "upon", "the", "water"] },
    ],
  },
  {
    id: "titanic-legend",
    lines: [
      { id: 1, text: "The giant ship sailed across the cold ocean.", words: ["The", "giant", "ship", "sailed", "across", "the", "cold", "ocean"] },
      { id: 2, text: "Passengers admired the elegant grand design.", words: ["Passengers", "admired", "the", "elegant", "grand", "design"] },
      { id: 3, text: "Music echoed softly through the dining halls.", words: ["Music", "echoed", "softly", "through", "the", "dining", "halls"] },
      { id: 4, text: "A sudden iceberg emerged in dark waters.", words: ["A", "sudden", "iceberg", "emerged", "in", "dark", "waters"] },
      { id: 5, text: "Brave souls stood together until the end.", words: ["Brave", "souls", "stood", "together", "until", "the", "end"] },
      { id: 6, text: "Its memory lives forever in human history.", words: ["Its", "memory", "lives", "forever", "in", "human", "history"] },
    ],
  },
];

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateAudio(voiceId, text, outputPath) {
  if (fs.existsSync(outputPath)) {
    return true;
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: text,
        model_id: MODEL_ID,
        voice_settings: {
          stability: 0.85,
          similarity_boost: 0.85,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`❌ Error (${text}): ${err}`);
      return false;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ [${voiceId.slice(0, 5)}] Saved: ${outputPath}`);
    return true;
  } catch (e) {
    console.error(`❌ Exception:`, e.message);
    return false;
  }
}

async function main() {
  console.log("═══════════════════════════════════════════════");
  console.log("🎙️  WordFlow Dual-Voice ElevenLabs Generator");
  console.log("═══════════════════════════════════════════════");

  for (const voice of VOICES) {
    console.log(`\n🗣️ Generating for Voice: ${voice.name} (${voice.folder})...`);

    const voiceDir = path.join(BASE_OUTPUT_DIR, voice.folder);
    const sentencesDir = path.join(voiceDir, "sentences");
    const wordsDir = path.join(voiceDir, "words");
    ensureDir(sentencesDir);
    ensureDir(wordsDir);

    const allWords = new Set();

    for (const story of ALL_STORIES) {
      const storyDir = path.join(sentencesDir, story.id);
      ensureDir(storyDir);

      for (const line of story.lines) {
        const out = path.join(storyDir, `line_${line.id}.mp3`);
        await generateAudio(voice.id, line.text, out);

        for (const w of line.words) {
          allWords.add(w.toLowerCase());
        }
        await sleep(DELAY_BETWEEN_REQUESTS_MS);
      }
    }

    for (const w of [...allWords].sort()) {
      const safe = w.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      const out = path.join(wordsDir, `${safe}.mp3`);
      await generateAudio(voice.id, w, out);
      await sleep(DELAY_BETWEEN_REQUESTS_MS);
    }
  }

  console.log("\n✅ DUAL VOICE GENERATION COMPLETE!");
}

main().catch(console.error);
