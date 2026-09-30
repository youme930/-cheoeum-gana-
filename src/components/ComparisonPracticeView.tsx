import React, { useState } from 'react';
import { KanaPair } from '../types/kana';
import { KanaWritingCanvas } from './KanaWritingCanvas';
import { sounds } from '../utils/audio';

interface ComparisonPracticeViewProps {
  pair: KanaPair;
  onBackToMain: () => void;
  onProceedToBlindTest: () => void;
  onMarkPracticed: (pairId: string) => void;
}

export const ComparisonPracticeView: React.FC<ComparisonPracticeViewProps> = ({
  pair,
  onBackToMain,
  onProceedToBlindTest,
  onMarkPracticed,
}) => {
  // Left character drawing & completion states
  const [leftHasDrawn, setLeftHasDrawn] = useState<boolean>(false);
  const [leftResetKey, setLeftResetKey] = useState<number>(0);
  const [leftAudioActive, setLeftAudioActive] = useState<boolean>(false);

  // Right character drawing & completion states
  const [rightHasDrawn, setRightHasDrawn] = useState<boolean>(false);
  const [rightResetKey, setRightResetKey] = useState<number>(0);
  const [rightAudioActive, setRightAudioActive] = useState<boolean>(false);

  // Left unlocks Right as soon as user draws on left or manually completes
  const [leftIsUnlocked, setLeftIsUnlocked] = useState<boolean>(false);

  const handleLeftHasDrawn = (hasDrawn: boolean) => {
    setLeftHasDrawn(hasDrawn);
    if (hasDrawn && !leftIsUnlocked) {
      setLeftIsUnlocked(true);
      onMarkPracticed(pair.id);
    }
  };

  const handleRightHasDrawn = (hasDrawn: boolean) => {
    setRightHasDrawn(hasDrawn);
  };

  // Audio Play
  const handlePlayAudio = (text: string, side: 'left' | 'right') => {
    if (side === 'left') {
      setLeftAudioActive(true);
      sounds.speakKana(text);
      setTimeout(() => setLeftAudioActive(false), 500);
    } else {
      setRightAudioActive(true);
      sounds.speakKana(text);
      setTimeout(() => setRightAudioActive(false), 500);
    }
  };

  const handleResetLeft = () => {
    setLeftResetKey((prev) => prev + 1);
    setLeftHasDrawn(false);
  };

  const handleResetRight = () => {
    setRightResetKey((prev) => prev + 1);
    setRightHasDrawn(false);
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 md:px-8 py-6 md:py-8 flex flex-col gap-6">
      {/* Top Context & Step Bar (Matching Image 1 & 7) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-[#e0bec1]/30">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToMain}
              type="button"
              className="inline-flex items-center gap-1 text-[#594143] hover:text-[#b32349] text-xs font-bold transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>{pair.categoryLabel}</span>
            </button>
            <span className="text-[#8c7073] text-xs">•</span>
            <span className="text-[#b32349] text-xs font-bold">{pair.subtitle}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#181a2e] tracking-tight">
            {pair.title}
          </h1>
        </div>

        {/* Progression Track */}
        <div className="flex items-center gap-3 bg-[#f4f2ff] px-4 py-2 rounded-full self-start md:self-auto border border-[#e0bec1]/30">
          {leftIsUnlocked ? (
            <div className="flex items-center gap-1.5 text-[#00658e] text-xs md:text-sm font-bold">
              <span className="material-symbols-outlined text-[16px] text-[#00658e]">
                check_circle
              </span>
              <span>1단계: {pair.leftChar.character} 작성 중 ✓</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[#b32349] text-xs md:text-sm font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#b32349] animate-pulse"></span>
              <span>1단계: {pair.leftChar.character} 따라 쓰기</span>
            </div>
          )}

          <span className="material-symbols-outlined text-[16px] text-[#8c7073]">east</span>

          {leftIsUnlocked ? (
            <div className="flex items-center gap-2 text-[#b32349] text-xs md:text-sm font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#b32349] animate-pulse"></span>
              <span>2단계: {pair.rightChar.character} 비교해 쓰기</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[#594143]/60 text-xs md:text-sm">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              <span>2단계: {pair.rightChar.character} 비교해 쓰기</span>
            </div>
          )}
        </div>
      </div>

      {/* Main 5:5 Side-by-Side Comparison Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* LEFT COLUMN: 문자 A (Active State) */}
        <div className="flex flex-col bg-white rounded-2xl overflow-hidden relative transition-all duration-300 shadow-md border border-[#e0bec1]/40">
          {/* Top visual indicator line */}
          <div className="h-1.5 w-full bg-[#ff5e7e]"></div>

          <div className="p-5 md:p-6 flex flex-col flex-1 justify-between gap-5">
            {/* Card Header Details */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#ffd9dd] text-[#400012] text-xs font-bold">
                  {leftIsUnlocked ? '1단계 작성 중' : '1단계 진행 중'}
                </span>
                <div className="flex items-baseline gap-1.5 ml-1">
                  <span className="font-kana text-4xl md:text-5xl text-[#b32349] font-black leading-none">
                    {pair.leftChar.character}
                  </span>
                  <span className="text-base font-extrabold text-[#181a2e]">
                    [{pair.leftChar.romaji} / {pair.leftChar.korean}]
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-[#f4f2ff] px-3 py-1 rounded-lg text-xs font-bold text-[#b32349]">
                <span className="material-symbols-outlined text-[15px]">draw</span>
                <span>총 {pair.leftChar.strokeCount}획</span>
              </div>
            </div>

            {/* Universal KanaWritingCanvas Component for Left Character */}
            <div className="w-full">
              <KanaWritingCanvas
                key={`canvas-left-${pair.leftChar.character}`}
                kana={pair.leftChar}
                showTraceGuide={true}
                colorScheme="primary"
                resetKey={leftResetKey}
                onHasDrawnChange={handleLeftHasDrawn}
              />
            </div>

            {/* Bottom Card Controls & Audio */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleResetLeft}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#f4f2ff] hover:bg-[#e6e6ff] text-[#181a2e] text-xs md:text-sm font-bold rounded-xl transition-all active:scale-95 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                  <span>다시 쓰기</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePlayAudio(pair.leftChar.audioText, 'left')}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs md:text-sm font-bold rounded-xl transition-all active:scale-95 ${
                    leftAudioActive
                      ? 'bg-[#b32349] text-white shadow-sm'
                      : 'bg-[#c7e7ff]/70 hover:bg-[#c7e7ff] text-[#00658e]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">volume_up</span>
                  <span>발음 듣기 [{pair.leftChar.romaji}]</span>
                </button>
              </div>

              {/* Distinction Tip Callout */}
              <div className="bg-[#ffd9dd]/40 p-3 rounded-xl flex items-center gap-2 border border-[#ffd9dd]/60">
                <span className="material-symbols-outlined text-[#b32349] text-[20px] shrink-0">
                  edit_note
                </span>
                <p className="text-xs text-[#181a2e]">
                  <span className="font-bold text-[#b32349]">연습 안내:</span> {pair.leftChar.tipText}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 문자 B (Locked initially, Unlocked when Left complete) */}
        <div
          className={`flex flex-col bg-white rounded-2xl overflow-hidden relative transition-all duration-500 ${
            leftIsUnlocked
              ? 'shadow-md border-2 border-[#b32349]'
              : 'shadow-sm opacity-95 border border-[#e0bec1]/40'
          }`}
        >
          {/* Top visual indicator line */}
          <div
            className={`h-1.5 w-full ${leftIsUnlocked ? 'bg-[#b32349]' : 'bg-[#e0e0fc]'}`}
          ></div>

          <div className="p-5 md:p-6 flex flex-col flex-1 justify-between gap-5 relative">
            {/* Card Header Details */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {leftIsUnlocked ? (
                  <span className="px-3 py-1 rounded-full bg-[#ffd9dd] text-[#400012] text-xs font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#b32349] animate-pulse"></span>
                    <span>2단계 진행 중</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-[#e6e6ff] text-[#594143] text-xs font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                    <span>2단계 잠김</span>
                  </span>
                )}
                <div className="flex items-baseline gap-1.5 ml-1">
                  <span
                    className={`font-kana text-4xl md:text-5xl font-black leading-none ${
                      leftIsUnlocked ? 'text-[#b32349]' : 'text-[#8c7073]/70'
                    }`}
                  >
                    {pair.rightChar.character}
                  </span>
                  <span className="text-base font-extrabold text-[#181a2e]">
                    [{pair.rightChar.romaji} / {pair.rightChar.korean}]
                  </span>
                </div>
              </div>

              {leftIsUnlocked ? (
                <div className="flex items-center gap-1.5 bg-[#ffd9dd]/50 px-3 py-1 rounded-lg text-xs font-bold text-[#b32349]">
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                  <span>비교 연습 중 (총 {pair.rightChar.strokeCount}획)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 bg-[#f4f2ff] px-2.5 py-1 rounded-lg text-xs text-[#594143]/60">
                  <span className="material-symbols-outlined text-[14px]">lock_clock</span>
                  <span>대기 중 (왼쪽 완료 후 시작)</span>
                </div>
              )}
            </div>

            {/* Universal KanaWritingCanvas Component for Right Character */}
            <div className="w-full">
              <KanaWritingCanvas
                key={`canvas-right-${pair.rightChar.character}`}
                kana={pair.rightChar}
                isLocked={!leftIsUnlocked}
                lockOverlayTitle={`${pair.rightChar.character} 연습실 대기 중`}
                lockOverlayDesc={`왼쪽 ${pair.leftChar.character}를 먼저 마우스나 터치로 써보면 잠금이 해제되고 직접 쓸 수 있습니다.`}
                onSimulateUnlock={() => setLeftIsUnlocked(true)}
                showTraceGuide={true}
                colorScheme="secondary"
                resetKey={rightResetKey}
                onHasDrawnChange={handleRightHasDrawn}
              />
            </div>

            {/* Bottom Card Controls & Audio */}
            <div className="flex flex-col gap-3">
              <div
                className={`flex items-center justify-between gap-3 transition-opacity duration-300 ${
                  leftIsUnlocked ? 'opacity-100' : 'opacity-50 pointer-events-none'
                }`}
              >
                <button
                  type="button"
                  onClick={handleResetRight}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#f4f2ff] hover:bg-[#e6e6ff] text-[#181a2e] text-xs md:text-sm font-bold rounded-xl transition-all active:scale-95 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                  <span>다시 쓰기</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePlayAudio(pair.rightChar.audioText, 'right')}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs md:text-sm font-bold rounded-xl transition-all active:scale-95 ${
                    rightAudioActive
                      ? 'bg-[#00658e] text-white shadow-sm'
                      : 'bg-[#c7e7ff]/70 hover:bg-[#c7e7ff] text-[#00658e]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">volume_up</span>
                  <span>발음 듣기 [{pair.rightChar.romaji}]</span>
                </button>
              </div>

              {/* Distinction Summary */}
              <div className="bg-[#f4f2ff] p-3 rounded-xl flex items-center gap-2 border border-[#e0bec1]/20">
                <span className="material-symbols-outlined text-[#00658e] text-[20px] shrink-0">
                  difference
                </span>
                <p className="text-xs text-[#594143] leading-relaxed">
                  <span className="font-bold text-[#00658e]">차이점:</span> {pair.differenceDetail}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action & Review CTA Container (Matching Image 1 & 7) */}
      <div className="mt-2 flex flex-col items-center justify-center p-6 bg-[#f4f2ff]/80 rounded-2xl gap-3 text-center border border-[#e0bec1]/30">
        <button
          type="button"
          disabled={!leftIsUnlocked}
          onClick={onProceedToBlindTest}
          className={`px-8 py-3.5 rounded-full font-bold text-base md:text-lg flex items-center gap-2 transition-all active:scale-95 shadow-sm group ${
            leftIsUnlocked
              ? 'bg-white hover:bg-[#ffd9dd] text-[#181a2e] cursor-pointer ring-2 ring-[#b32349]/20'
              : 'bg-[#e6e6ff] text-[#594143]/50 cursor-not-allowed'
          }`}
        >
          <span
            className={`material-symbols-outlined ${
              leftIsUnlocked
                ? 'text-[#b32349] group-hover:rotate-12 transition-transform'
                : 'text-[#8c7073]/50'
            }`}
          >
            {leftIsUnlocked ? 'school' : 'lock'}
          </span>
          <span>가이드 없이 테스트하기</span>
          <span className="material-symbols-outlined text-[20px] text-[#594143]">
            arrow_forward
          </span>
        </button>

        <p className="text-xs text-[#594143]/80">
          {leftIsUnlocked
            ? `※ ${pair.leftChar.character}와 ${pair.rightChar.character}를 모두 써본 후 블라인드 테스트로 실력을 점검해보세요.`
            : `※ ${pair.leftChar.character}와 ${pair.rightChar.character}를 모두 써본 후 테스트가 열립니다. (${pair.leftChar.character} 쓰기 진행 중)`}
        </p>
      </div>
    </div>
  );
};
