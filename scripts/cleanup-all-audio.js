// Delete ALL existing word + sentence audio files so they can be regenerated fresh
const fs = require("fs");
const path = require("path");

const wordsDir = "public/audio/voice_sarah/words";
const sentencesDir = "public/audio/voice_sarah/sentences";

let deleted = 0;

// Delete all word files
if (fs.existsSync(wordsDir)) {
  const wordFiles = fs.readdirSync(wordsDir).filter(f => f.endsWith(".mp3"));
  wordFiles.forEach(f => {
    fs.unlinkSync(path.join(wordsDir, f));
    deleted++;
  });
  console.log(`Deleted ${wordFiles.length} word files from ${wordsDir}`);
}

// Delete all sentence line files (recursively)
function deleteRecursive(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      deleteRecursive(fullPath);
    } else if (entry.name.endsWith(".mp3")) {
      fs.unlinkSync(fullPath);
      deleted++;
    }
  });
}

deleteRecursive(sentencesDir);
console.log(`\nTotal deleted: ${deleted} MP3 files`);
console.log("All old audio cleared. Run generate-all-voices.bat to regenerate everything fresh.");
