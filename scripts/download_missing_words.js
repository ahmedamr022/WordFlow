const fs = require("fs");
const path = require("path");
const https = require("https");

const wordsToEnsure = [
  "the", "magic", "bookshelf", "was", "filled", "with", "ancient", "stories",
  "stars", "shine", "brightly", "over", "streets", "of", "cairo",
  "ship", "set", "sail", "across", "atlantic", "ocean",
  "letter", "ready", "learn", "word", "words"
];

const voiceFolders = [
  "voice_sarah",
  "voice_laura",
  "voice_alice",
  "voice_chris",
  "voice_daniel",
  "voice_jessica"
];

function downloadAudio(word, destPath) {
  return new Promise((resolve) => {
    if (fs.existsSync(destPath)) {
      return resolve(true);
    }

    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(word)}&tl=en-US&total=1&idx=0&textlen=${word.length}&client=tw-ob`;
    
    const options = {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    };

    const file = fs.createWriteStream(destPath);
    https.get(url, options, (res) => {
      if (res.statusCode === 200) {
        res.pipe(file);
        file.on("finish", () => {
          file.close();
          console.log(`[Downloaded] ${word} -> ${destPath}`);
          resolve(true);
        });
      } else {
        file.close();
        fs.unlinkSync(destPath);
        console.error(`[Failed ${res.statusCode}] ${word}`);
        resolve(false);
      }
    }).on("error", (err) => {
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      console.error(`[Error] ${word}:`, err.message);
      resolve(false);
    });
  });
}

async function run() {
  for (const folder of voiceFolders) {
    const dir = path.join(__dirname, "..", "public", "audio", folder, "words");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    for (const word of wordsToEnsure) {
      const cleanWord = word.trim().replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      if (!cleanWord) continue;
      const filePath = path.join(dir, `${cleanWord}.mp3`);
      await downloadAudio(cleanWord, filePath);
    }
  }
  console.log("Done downloading missing word audio files!");
}

run();
