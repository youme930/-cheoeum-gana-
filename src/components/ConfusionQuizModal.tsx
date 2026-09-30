import React, { useState } from 'react';
import { KANA_PAIRS } from '../data/kanaPairs';
import { sounds } from '../utils/audio';

interface ConfusionQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface QuizItem {
  id: number;
  question: string;
  targetChar: string;
  romaji: string;
  correctAnswer: string;
  options: string[];
  explanation: string;
}

const QUIZ_ITEMS: QuizItem[] = [
  {
    id: 1,
    question: '다음 중 끝에 동그란 "돼지꼬리 매듭"이 있는 글자는 무엇일까요?',
    targetChar: '누',
    romaji: 'nu',
    correctAnswer: 'ぬ',
    options: ['ぬ', 'め'],
    explanation: 'ぬ(nu)는 끝에 돼지꼬리 모양의 둥근 매듭이 있고, め(me)는 꼬리 없이 시원하게 빠집니다.',
  },
  {
    id: 2,
    question: '세 번째 긴 획을 "아래에서 위로 올려치는" 가타카나는?',
    targetChar: '시',
    romaji: 'shi',
    correctAnswer: 'シ',
    options: ['シ', 'ツ'],
    explanation: 'シ(shi)는 아래에서 위로 올려치고, ツ(tsu)는 위에서 아래로 내리꽂습니다.',
  },
  {
    id: 3,
    question: '오른쪽 끝이 바깥쪽으로 번개처럼 "꺾여 올라가는" 글자는?',
    targetChar: '레',
    romaji: 're',
    correctAnswer: 'れ',
    options: ['れ', 'わ'],
    explanation: 'れ(re)는 바깥쪽으로 꺾여 올라가고, わ(wa)는 둥글게 안쪽으로 감깁니다.',
  },
  {
    id: 4,
    question: '긴 획을 "위에서 아래로 미끄러지듯 내리긋는" 가타카나는?',
    targetChar: '소',
    romaji: 'so',
    correctAnswer: 'ソ',
    options: ['ソ', 'ン'],
    explanation: 'ソ(so)는 위에서 아래로 내리고, ン(n)은 아래에서 위로 삐쳐 올립니다.',
  },
  {
    id: 5,
    question: '글자 오른쪽 위에 "독립된 점(3획)"을 따로 찍는 글자는?',
    targetChar: '오',
    romaji: 'o',
    correctAnswer: 'お',
    options: ['あ', 'お'],
    explanation: 'あ(a)는 중앙 세로선을 관통하는 루프가 있고, お(o)는 우측 상단에 독립된 점(3획)이 있습니다.',
  },
];

export const ConfusionQuizModal: React.FC<ConfusionQuizModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  if (!isOpen) return null;

  const currentQuiz = QUIZ_ITEMS[currentIndex];

  const handleSelectOption = (opt: string) => {
    if (selectedOption !== null) return;
    setSelectedOption(opt);

    const isCorrect = opt === currentQuiz.correctAnswer;
    if (isCorrect) {
      sounds.playStrokeSuccess();
      setScore((prev) => prev + 1);
    } else {
      sounds.playError();
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    if (currentIndex + 1 < QUIZ_ITEMS.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
      sounds.playCompleteChime();
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#181a2e]/50 backdrop-blur-md">
      <div className="relative w-full max-w-[500px] bg-white rounded-2xl shadow-2xl p-6 flex flex-col gap-5 border border-[#e0bec1]/40">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e0bec1]/30 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00658e]"></span>
            <span className="font-extrabold text-[#181a2e] text-base">
              헷갈림 1초 구별 퀴즈
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#594143] hover:bg-[#f4f2ff]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {!isFinished ? (
          <div className="flex flex-col gap-4">
            {/* Progress */}
            <div className="flex items-center justify-between text-xs text-[#594143]">
              <span>
                문제 <strong>{currentIndex + 1}</strong> / {QUIZ_ITEMS.length}
              </span>
              <span>
                맞힌 개수: <strong>{score}</strong>
              </span>
            </div>

            {/* Question Card */}
            <div className="p-4 bg-[#f4f2ff] rounded-2xl text-center flex flex-col items-center gap-2 border border-[#e0bec1]/20">
              <span className="text-xs font-bold text-[#b32349] px-2.5 py-0.5 rounded-full bg-[#ffd9dd]">
                구별 포인트 퀴즈
              </span>
              <p className="text-base font-bold text-[#181a2e] leading-snug">
                {currentQuiz.question}
              </p>
            </div>

            {/* 2 Big Choice Buttons */}
            <div className="grid grid-cols-2 gap-4">
              {currentQuiz.options.map((opt) => {
                const isSelected = selectedOption === opt;
                const isCorrect = opt === currentQuiz.correctAnswer;
                let btnStyle = 'bg-white hover:bg-[#ffd9dd]/30 border-[#e0bec1]/50';

                if (selectedOption !== null) {
                  if (isCorrect) {
                    btnStyle = 'bg-[#c7e7ff] text-[#00658e] border-[#00658e] shadow-sm';
                  } else if (isSelected) {
                    btnStyle = 'bg-[#ffdad6] text-[#ba1a1a] border-[#ba1a1a] shadow-sm';
                  } else {
                    btnStyle = 'bg-white opacity-40 border-[#e0bec1]/30';
                  }
                }

                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelectOption(opt)}
                    className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 ${btnStyle}`}
                  >
                    <span className="font-kana text-5xl font-black">{opt}</span>
                    <span className="text-xs font-bold">
                      {selectedOption !== null && isCorrect && '정답 ✓'}
                      {selectedOption !== null && !isCorrect && isSelected && '오답 ✗'}
                      {selectedOption === null && '선택하기'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Explanation & Next */}
            {selectedOption !== null && (
              <div className="p-3 bg-[#edecff] rounded-xl flex flex-col gap-2">
                <p className="text-xs text-[#181a2e] leading-relaxed">
                  💡 {currentQuiz.explanation}
                </p>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full py-2.5 rounded-xl bg-[#b32349] hover:bg-[#910033] text-white text-xs font-bold transition-all"
                >
                  {currentIndex + 1 < QUIZ_ITEMS.length ? '다음 문제' : '결과 보기'}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Finished State */
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <div className="w-16 h-16 rounded-full bg-[#ffd9dd] text-[#b32349] flex items-center justify-center">
              <span className="material-symbols-outlined text-[36px]">emoji_events</span>
            </div>
            <h3 className="text-2xl font-black text-[#181a2e]">퀴즈 완료!</h3>
            <p className="text-sm text-[#594143]">
              총 {QUIZ_ITEMS.length}문제 중 <strong>{score}</strong>문제를 맞혔습니다!
            </p>
            <div className="flex gap-2 w-full pt-2">
              <button
                type="button"
                onClick={handleRestart}
                className="flex-1 py-3 rounded-xl bg-[#f4f2ff] hover:bg-[#e6e6ff] text-[#181a2e] text-xs font-bold"
              >
                다시 풀기
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-[#b32349] hover:bg-[#910033] text-white text-xs font-bold"
              >
                학습 계속하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
