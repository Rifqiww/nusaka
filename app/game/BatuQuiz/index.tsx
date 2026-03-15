import React, { useState, useEffect } from 'react';
import { Timer, Star, Award, ChevronRight, CheckCircle2, XCircle, RotateCcw, Save, Sparkles, AlertCircle } from 'lucide-react';
import { useStoneStore } from '../stoneStore';
import { useJoystickStore } from '../store';
import { QUIZ_DATA, TOTAL_TIME, XP_PER_QUESTION, QUESTIONS_PER_ROUND } from './data';
import { randomizeBatuPosition } from '../Planet';

export default function BatuQuiz() {
  const { endMinigame, nearbyStoneId, triggerRespawn } = useStoneStore();
  const setMenuState = useJoystickStore(s => s.setMenuState);

  const [gameState, setGameState] = useState<'intro' | 'animating' | 'playing' | 'feedback' | 'finished' | 'timeout' | 'fading_out'>('intro');
  const [activeQuestions, setActiveQuestions] = useState<typeof QUIZ_DATA>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [xp, setXp] = useState(0);
  
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });
  const [userAnswers, setUserAnswers] = useState<any[]>([]);
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [savedData, setSavedData] = useState<any>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (gameState === 'playing' && timeLeft === 0) {
      setGameState('timeout');
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const handleStoneClick = () => {
    setGameState('animating');
    setTimeout(() => {
      startQuiz();
    }, 1500);
  };

  const startQuiz = () => {
    const shuffled = [...QUIZ_DATA].sort(() => 0.5 - Math.random());
    setActiveQuestions(shuffled.slice(0, QUESTIONS_PER_ROUND));
    setCurrentQuestionIdx(0);
    setTimeLeft(TOTAL_TIME);
    setXp(0);
    setStats({ correct: 0, wrong: 0 });
    setUserAnswers([]);
    setSavedData(null);
    setGameState('playing');
  };

  const handleAnswerClick = (option: string) => {
    if (gameState !== 'playing' || activeQuestions.length === 0) return;

    const question = activeQuestions[currentQuestionIdx];
    const correct = option === question.correctAnswer;
    
    setSelectedOption(option);
    setIsCorrect(correct);
    setGameState('feedback');

    if (correct) {
      setXp(prev => prev + XP_PER_QUESTION);
      setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));
    }

    setUserAnswers(prev => [...prev, {
      questionId: question.id,
      selected: option,
      isCorrect: correct
    }]);

    setTimeout(() => {
      if (currentQuestionIdx < QUESTIONS_PER_ROUND - 1) {
        setCurrentQuestionIdx(prev => prev + 1);
        setSelectedOption(null);
        setIsCorrect(null);
        setGameState('playing');
      } else {
        setGameState('finished');
      }
    }, 3000);
  };

  const quitMinigame = () => {
    endMinigame();
    setMenuState('playing');
  };

  const finishAndRespawn = () => {
    setGameState('fading_out');
    setTimeout(() => {
        if (nearbyStoneId !== null) {
          randomizeBatuPosition(nearbyStoneId);
          triggerRespawn();
        }
        quitMinigame();
    }, 1000);
  };

  const renderAnimating = () => (
    <div className="flex flex-col items-center justify-center h-full w-full bg-stone-950 z-100 animate-entrance-zoom pointer-events-auto">
       <img src="/Nusaka.svg" alt="Nusaka Logo" className="w-32 h-32 animate-pulse" />
    </div>
  );

  // 1. Layar Intro
  const renderIntro = () => (
    <div className="flex flex-col items-center justify-center h-full text-stone-100 p-6 pointer-events-auto">
      <div className="max-w-md w-full bg-stone-800 rounded-3xl p-8 border-2 border-stone-700 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="text-center mb-8 relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 mb-4 bg-stone-700 rounded-full flex items-center justify-center border-4 border-stone-600 shadow-inner">
            <Sparkles className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-stone-200 mb-2 uppercase tracking-widest font-serif">Batu Quiz</h2>
          <p className="text-stone-400 text-sm leading-relaxed max-w-sm mt-4 italic">"Batu ini menyimpan banyak pertanyaan berharga dari kehidupan ini."</p>
          <p className="text-stone-300 text-sm leading-relaxed max-w-sm mt-2 font-medium">Kamu akan menjawab {QUESTIONS_PER_ROUND} pertanyaan dari Batu quiz selama 1 menit.</p>
        </div>

        <div className="flex flex-col gap-3 relative z-10 w-full mt-8">
          <button 
            onClick={handleStoneClick}
            className="w-full py-4 rounded-xl cursor-pointer bg-linear-to-b from-stone-600 to-stone-800 hover:from-stone-500 hover:to-stone-700 border-2 border-stone-500 text-stone-200 font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            Eksplor Batu
          </button>
          <button 
            onClick={quitMinigame}
            className="w-full py-4 rounded-xl cursor-pointer bg-transparent hover:bg-stone-800 border-2 border-stone-700 text-stone-400 hover:text-stone-200 font-bold text-lg transition-all"
          >
            Tinggalkan
          </button>
        </div>
      </div>
    </div>
  );

  // 2. Layar Quiz
  const renderQuiz = () => {
    if (activeQuestions.length === 0) return null;
    const question = activeQuestions[currentQuestionIdx];
    const isFeedback = gameState === 'feedback';

    return (
      <div className="flex flex-col h-full text-stone-100 p-4 md:p-8 pointer-events-auto w-full max-w-4xl mx-auto overflow-y-auto">
        <div className="min-h-full flex flex-col py-4 md:py-0">
          <header className="flex justify-between items-center w-full mb-8 bg-stone-900/90 backdrop-blur-md p-4 rounded-2xl border border-stone-800 shadow-xl shrink-0">
          <div className="flex flex-col">
            <span className="text-xs text-stone-400 uppercase tracking-wider font-bold mb-1">Progress</span>
            <span className="font-bold text-emerald-400 text-lg">Soal {currentQuestionIdx + 1} <span className="text-stone-500">/ {QUESTIONS_PER_ROUND}</span></span>
          </div>
          
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-lg
            ${timeLeft <= 10 ? 'bg-red-900/50 text-red-400 animate-pulse' : 'bg-stone-800 text-amber-400'}`}>
            <Timer size={20} />
            {timeLeft}s
          </div>

          <div className="flex flex-col items-end">
            <span className="text-xs text-stone-400 uppercase tracking-wider font-bold mb-1">Reward</span>
            <span className="font-bold text-yellow-400 flex items-center gap-1">
              <Star size={16} fill="currentColor" /> {xp} XP
            </span>
          </div>
        </header>

        <div className="w-full h-2 bg-stone-800 rounded-full mb-8 overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${((currentQuestionIdx) / QUESTIONS_PER_ROUND) * 100}%` }}
          ></div>
        </div>

        <main className="w-full flex-1 flex flex-col justify-center">
          <div className="bg-stone-800/90 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-stone-700 shadow-xl mb-8">
            <h2 className="text-2xl md:text-3xl font-bold leading-relaxed text-center">
              {question.question}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.options.map((option, idx) => {
              const alphabet = ['A', 'B', 'C', 'D'][idx];
              let buttonStyle = "from-stone-700 to-stone-800 border-stone-600 hover:from-stone-600 hover:to-stone-700 text-stone-200";
              let statusIcon = null;

              if (isFeedback) {
                if (option === question.correctAnswer) {
                  buttonStyle = "from-emerald-700 to-emerald-900 border-emerald-500 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.4)]";
                  statusIcon = <CheckCircle2 className="text-emerald-400 absolute right-4" />;
                } else if (option === selectedOption) {
                  buttonStyle = "from-red-900 to-red-950 border-red-700 text-red-200 animate-stone-crack opacity-80";
                  statusIcon = <XCircle className="text-red-400 absolute right-4" />;
                } else {
                  buttonStyle = "from-stone-800 to-stone-900 border-stone-800 opacity-50 text-stone-500";
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isFeedback}
                  onClick={() => handleAnswerClick(option)}
                  className={`relative flex items-center p-4 rounded-2xl cursor-pointer bg-linear-to-b border-b-4 border-2 transition-all duration-200 
                    ${!isFeedback ? 'active:border-b-0 active:translate-y-[4px]' : ''} 
                    ${buttonStyle} shadow-lg`}
                >
                  <div className="w-10 h-10 rounded-full bg-stone-900/50 flex items-center justify-center font-bold text-lg mr-4 border border-stone-600/50">
                    {alphabet}
                  </div>
                  <span className="font-semibold text-lg text-left pr-8">{option}</span>
                  {statusIcon}
                </button>
              );
            })}
          </div>

          {isFeedback && (
            <div className={`mt-8 p-6 rounded-2xl border hidden md:block ${isCorrect ? 'bg-emerald-900/80 border-emerald-500/50' : 'bg-red-900/80 border-red-500/50'} backdrop-blur-md animate-fade-in`}>
              <div className="flex items-center gap-3 mb-2">
                {isCorrect ? (
                  <h3 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-emerald-400" /> Benar! <span className="text-sm bg-emerald-500/20 px-2 py-1 rounded text-emerald-300 ml-2">+10 XP</span>
                  </h3>
                ) : (
                  <h3 className="text-xl font-bold text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-6 h-6 text-red-400" /> Salah!
                  </h3>
                )}
              </div>
              <p className="text-stone-300 leading-relaxed mt-2">
                {!isCorrect && <span className="block text-emerald-400 font-semibold mb-1">Jawaban yang benar: {question.correctAnswer}</span>}
                {question.explanation}
              </p>
              <div className="mt-4 flex justify-end">
                <span className="text-stone-500 text-sm flex items-center gap-1 animate-pulse">
                  Menuju soal berikutnya <ChevronRight size={16} />
                </span>
              </div>
            </div>
          )}

          {/* Mobile Feedback Popup */}
          {isFeedback && (
            <div className="fixed inset-0 z-100 flex items-center justify-center p-6 md:hidden">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
              <div className={`relative w-full max-w-sm p-6 rounded-3xl border-2 animate-stone-crack ${isCorrect ? 'bg-emerald-950 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'bg-red-950 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]'}`}>
                 <div className="flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isCorrect ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                       {isCorrect ? <CheckCircle2 className="w-10 h-10 text-emerald-400" /> : <XCircle className="w-10 h-10 text-red-400" />}
                    </div>
                    <h3 className={`text-2xl font-black mb-2 uppercase tracking-widest ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isCorrect ? 'Luar Biasa!' : 'Kurang Tepat!'}
                    </h3>
                    <p className="text-stone-300 leading-relaxed text-sm">
                      {!isCorrect && <span className="block text-emerald-400 font-bold mb-2">Jawaban: {question.correctAnswer}</span>}
                      {question.explanation}
                    </p>
                    <div className="mt-6 flex items-center gap-2 text-stone-500 text-xs font-bold uppercase tracking-tighter animate-pulse">
                       Menuju Soal Berikutnya <ChevronRight size={14} />
                    </div>
                 </div>
              </div>
            </div>
          )}
        </main>
        </div>
      </div>
    );
  };

  // 3. Layar Hasil
  const renderResult = () => {
    const isTimeout = gameState === 'timeout';
    const finalCorrect = stats.correct + (gameState === 'playing' && isCorrect ? 1 : 0);
    const finalWrong = stats.wrong + (gameState === 'playing' && !isCorrect ? 1 : 0);
    const finalXp = xp + (gameState === 'playing' && isCorrect ? XP_PER_QUESTION : 0);

    return (
      <div className="flex flex-col items-center justify-center h-full text-stone-100 p-6 pointer-events-auto">
        <div className="max-w-md w-full bg-stone-800 rounded-3xl p-8 border-2 border-stone-700 shadow-2xl relative backdrop-blur-md">
          
          <div className="text-center mb-8">
            {isTimeout ? (
              <>
                <div className="mx-auto inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-900/10 mb-4 animate-pulse">
                  <Timer size={40} className="text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-red-400 mb-2 uppercase tracking-widest font-serif">Waktu Habis!</h2>
                <p className="text-stone-400 italic">"Sayang sekali, kamu kehabisan waktu."</p>
              </>
            ) : (
              <>
                <div className="mx-auto inline-flex items-center justify-center w-24 h-24 rounded-full bg-stone-700 mb-4 relative border-4 border-stone-600 shadow-inner">
                  <Award className="text-yellow-400 w-12 h-12 absolute" />
                  <div className="absolute inset-0 border-4 border-emerald-500 rounded-full animate-ping opacity-20"></div>
                </div>
                <p className="text-stone-300 text-lg leading-relaxed max-w-sm mt-4 italic font-serif">
                  "Selamat kamu berhasil melewati pertanyaan dari Batu Quiz"
                </p>
              </>
            )}
          </div>

          <div className="bg-stone-900/50 rounded-2xl p-6 mb-8 border border-stone-700">
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-4 text-center">Hasil Penjelajahan</h3>
            <div className="flex justify-between items-center py-3 border-b border-stone-700">
              <span className="text-stone-400">Total EXP</span>
              <span className="font-bold text-yellow-400 flex items-center gap-1"><Star size={16} /> +{finalXp}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-stone-700">
              <span className="text-emerald-400">Benar</span>
              <span className="font-bold text-emerald-400">{finalCorrect}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-red-400">Salah</span>
              <span className="font-bold text-red-400">{finalWrong}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={finishAndRespawn}
              className="w-full py-4 rounded-xl cursor-pointer bg-linear-to-b from-stone-600 to-stone-800 hover:from-stone-500 hover:to-stone-700 border-2 border-stone-500 text-stone-200 font-bold text-lg transition-all shadow-lg"
            >
              Selesaikan
            </button>
          </div>
        </div>
      </div>
    );
  };

  const isDarkBg = gameState !== 'intro' && gameState !== 'fading_out';

  return (
    <div className={`absolute inset-0 z-50 transition-colors duration-1000 ${isDarkBg ? 'bg-[#0c0a09]' : 'bg-black/40 backdrop-blur-sm'} pointer-events-none`}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes stone-crack {
          0% { transform: translateX(0); }
          20% { transform: translateX(-3px) scale(0.98); }
          40% { transform: translateX(3px) scale(0.98); }
          60% { transform: translateX(-3px) scale(0.98); }
          80% { transform: translateX(3px) scale(0.98); }
          100% { transform: translateX(0) scale(1); background-image: linear-gradient(to right, transparent 48%, rgba(0,0,0,0.5) 49%, rgba(0,0,0,0.5) 51%, transparent 52%); }
        }
        .animate-stone-crack { animation: stone-crack 0.4s ease-out forwards; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes entrance-zoom {
          0% { transform: scale(1); opacity: 0; background-color: transparent; }
          40% { opacity: 1; background-color: rgba(28,25,23,0.9); }
          100% { transform: scale(5); opacity: 1; background-color: #0c0a09; }
        }
        @keyframes fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        .animate-entrance-zoom { animation: entrance-zoom 1.5s ease-in forwards; }
        .animate-fadeout { animation: fade-out 1s ease-out forwards; }
      `}} />

      {gameState === 'animating' ? renderAnimating() : null}
      {gameState === 'intro' ? renderIntro() : null}
      {gameState === 'playing' || gameState === 'feedback' ? renderQuiz() : null}
      {(gameState === 'finished' || gameState === 'timeout' || gameState === 'fading_out') && (
        <div className={`h-full w-full flex items-center justify-center ${gameState === 'fading_out' ? 'animate-fadeout' : ''}`}>
          {renderResult()}
        </div>
      )}
    </div>
  );
}
