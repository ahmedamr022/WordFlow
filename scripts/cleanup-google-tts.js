const fs = require("fs");
const path = require("path");

const dir = "public/audio/voice_sarah/words";

// Words that were downloaded from Google TTS (not ElevenLabs) — need to be deleted and regenerated
const googleTtsWords = [
  "magic", "bookshelf", "was", "shine", "brightly", "over", "cairo",
  "set", "sail", "atlantic", "open", "doors", "worlds", "nile", "river"
];

let deleted = 0;
googleTtsWords.forEach(w => {
  const f = path.join(dir, w + ".mp3");
  if (fs.existsSync(f)) {
    const stats = fs.statSync(f);
    // Google TTS files are typically very small or have different encoding
    console.log(`Deleting Google TTS file: ${w}.mp3 (${stats.size} bytes)`);
    fs.unlinkSync(f);
    deleted++;
  } else {
    console.log(`Already missing: ${w}.mp3`);
  }
});

console.log(`\nDeleted ${deleted} Google TTS files. Run generate-all-voices.bat to regenerate with ElevenLabs.`);
