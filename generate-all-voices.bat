@echo off
title WordFlow - Generate Missing Sarah Voice Audio (ElevenLabs)
echo =======================================================
echo   WordFlow - ElevenLabs Voice Generator (voice_sarah)
echo =======================================================
echo.
echo   Voice: Sarah (Calm Educational Tone)
echo   Stability: 0.85 / Similarity: 0.85 / Style: 0.10
echo.

set ELEVENLABS_API_KEY=sk_b4f1d5dc626c2d74ef5d8a186cd96f140beb90fb06b23a7f

node scripts/generate-sarah-words.mjs

echo.
echo ======= Generation Finished! =======
pause
