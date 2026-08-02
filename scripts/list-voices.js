const https = require("https");

const opts = {
  hostname: "api.elevenlabs.io",
  path: "/v1/voices",
  headers: {
    "xi-api-key": "sk_7efc3204476bd0d708ef27afcca2c394b2b7208cb4829f11"
  }
};

https.get(opts, (res) => {
  let data = "";
  res.on("data", (chunk) => data += chunk);
  res.on("end", () => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.voices) {
        parsed.voices.forEach(v => {
          console.log(`${v.voice_id} | ${v.name} | labels: ${JSON.stringify(v.labels || {})}`);
        });
      } else {
        console.log("Response:", data.substring(0, 500));
      }
    } catch (e) {
      console.log("Raw response:", data.substring(0, 500));
    }
  });
}).on("error", (e) => console.error("Error:", e.message));
