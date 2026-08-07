import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { VocabularyWord } from '../../types';
import { useVocabulary } from '../../hooks/useVocabulary';
import type { useReviewSession } from '../../hooks/useReviewSession';
import { ReviewIntroModal } from './ReviewIntroModal';
import { ReviewSessionModal } from './ReviewSessionModal';
import { ReviewSummaryModal } from './ReviewSummaryModal';

/**
 * Renders the whole review experience from one session object.
 * Any screen can mount this once and call `session.openIntro(words)`.
 */
export function ReviewFlow({
  session,
  reviewMorePool = []




}: {session: ReturnType<typeof useReviewSession>; /** Pool re-used when the learner taps "مراجعة كلمات أخرى". */reviewMorePool?: VocabularyWord[];}) {
  const navigate = useNavigate();
  const { streak, dailyXp, dailyGoalXp } = useVocabulary();

  return (
    <>
      <ReviewIntroModal
        open={session.phase === 'intro'}
        onClose={session.close}
        onStart={session.begin}
        wordCount={session.selection.length}
        minutes={session.estimatedMinutes}
        xp={session.estimatedXp}
        config={session.config}
        onConfigChange={session.setConfig}
        streak={streak} />
      

      <ReviewSessionModal
        open={session.phase === 'session'}
        word={session.current}
        index={session.index}
        total={session.queue.length}
        onGrade={session.submit}
        onSkip={session.skip}
        onFinish={session.finishEarly} />
      

      <ReviewSummaryModal
        open={session.phase === 'summary'}
        summary={session.summary}
        streak={streak}
        dailyXp={dailyXp}
        dailyGoalXp={dailyGoalXp}
        onReviewMore={() => {
          session.close();
          window.setTimeout(
            () => session.openIntro(reviewMorePool, 'جلسة إضافية'),
            0
          );
        }}
        onGoHome={() => {
          session.close();
          navigate('/');
        }}
        onClose={session.close} />
      
    </>);

}