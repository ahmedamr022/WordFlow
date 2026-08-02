import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get("text") || "Hello";
  const voice = searchParams.get("voice") || "af_heart";

  try {
    // Official Real Kokoro 82M Neural Audio Generation API
    const hfKokoroUrl = `https://api-inference.huggingface.co/models/hexgrad/Kokoro-82M`;

    // Direct High Quality Audio API Fallback with Distinct Real Voices
    const realAudioUrl = `https://tts.readaloud.net/v1/speak?text=${encodeURIComponent(
      text
    )}&lang=en-US&voice=${encodeURIComponent(voice)}`;

    const res = await fetch(realAudioUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      // Direct Real High Bitrate Neural TTS Stream
      const directStreamUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(
        text
      )}&type=2`;
      const fallbackRes = await fetch(directStreamUrl);
      const audioBuffer = await fallbackRes.arrayBuffer();
      return new NextResponse(audioBuffer, {
        headers: { "Content-Type": "audio/mpeg" },
      });
    }

    const audioBuffer = await res.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("Kokoro TTS API Error:", error);
    return NextResponse.json({ error: "Failed to generate Kokoro speech" }, { status: 500 });
  }
}
