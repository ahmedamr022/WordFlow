import React, { useCallback, useEffect, useState } from 'react';
import { TopBar } from './components/TopBar';
import { SentenceStage } from './components/SentenceStage';
import { PlaybackControls } from './components/PlaybackControls';
import { ProgressPanel } from './components/ProgressPanel';
import { ShortcutBar } from './components/ShortcutBar';
import { useSentencePlayback } from './hooks/useSentencePlayback';
import { useTypingSentence } from './hooks/useTypingSentence';
import { story, voices } from './data/story';

export function App() {
  const [index, setIndex] = useState(3);
  const [voice, setVoice] = useState(voices[0]);
  const [autoReplay, setAutoReplay] = useState(false);

  const sentence = story.sentences[index];
  const total = story.sentences.length;

  const goNext = useCallback(() => {
    setIndex((value) => Math.min(value + 1, total - 1));
  }, [total]);

  const { isPlaying, activeToken, play, toggle, stop } = useSentencePlayback({
    wordCount: sentence.tokens.length,
    autoReplay,
    onFinish: () => undefined
  });

  const { typed } = useTypingSentence({
    target: sentence.tokens.map((token) => token.text).join(' '),
    onComplete: goNext
  });

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === '\\') {
        event.preventDefault();
        toggle();
      }
      if (event.key === 'ArrowLeft') goNext();
      if (event.key === 'ArrowRight') {
        stop();
        setIndex((value) => Math.max(value - 1, 0));
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goNext, stop, toggle]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-ink-900 text-white">
      <img
        src={story.backgroundUrl}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
      
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
          'linear-gradient(90deg, rgba(3,5,12,0.92) 0%, rgba(3,5,12,0.72) 30%, rgba(3,5,12,0.18) 58%, rgba(3,5,12,0.05) 100%)'
        }} />
      
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
          'linear-gradient(180deg, rgba(3,5,12,0.55) 0%, rgba(3,5,12,0.05) 30%, rgba(3,5,12,0.35) 100%)'
        }} />
      

      <div className="relative z-10 flex min-h-screen flex-col">
        <TopBar />

        <main className="flex flex-1 flex-col px-6 pb-8 sm:px-10 lg:pl-[10%]">
          <div className="flex flex-col gap-9 pt-10 lg:pt-[9vh]">
            <SentenceStage
              sentence={sentence}
              level={story.level}
              activeToken={activeToken}
              typed={typed} />
            

            <PlaybackControls
              voices={voices}
              voice={voice}
              onVoiceChange={setVoice}
              isPlaying={isPlaying}
              onTogglePlay={toggle}
              onReplay={play} />
            

            <ProgressPanel current={index + 1} total={total} />
          </div>

          <div className="mt-auto pt-14">
            <ShortcutBar
              autoReplay={autoReplay}
              onToggleAutoReplay={() => setAutoReplay((value) => !value)} />
            
          </div>
        </main>
      </div>
    </div>);

}