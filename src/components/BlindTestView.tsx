import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { KanaPair } from '../types/kana';
import { KanaWritingCanvas } from './KanaWritingCanvas';
import { sounds } from '../utils/audio';

interface BlindTestViewProps {
  pair: KanaPair;
  onBackToPractice: () => void;
  onBackToMain: () => void;
  onCompleteMastery: (pairId: string) => void;
}

export const BlindTestView: React.FC<BlindTestViewProps> = ({
  pair,
  onBackToPractice,
  onBackToMain,
  onCompleteMastery,
}) => {
  // Left Canvas
  const [leftHasDrawn, setLeftHasDrawn] = useState(false);
  const [leftResetKey, setLeftResetKey] = useState(0);

  // Right Canvas
  const [rightHasDrawn, setRightHasDrawn] = useState(false);
  const [rightResetKey, setRightResetKey] = useState(0);

  // Modal State
  const [showResultModal, setShowResultModal] = useState(false);
  const [modalTab, setModalTab] = useState<'success' | 'failure'>('success');

  const handleLeftHasDrawn = (drawn: boolean) => {
    setLeftHasDrawn(drawn);
  };

  const handleRightHasDrawn = (drawn: boolean) => {
    setRightHasDrawn(drawn);
  };

  // Reset All
  const handleResetAll = () => {
    setLeftHasDrawn(false);
    setLeftResetKey((prev) => prev + 1);
    setRightHasDrawn(false);
    setRightResetKey((prev) => prev + 1);
  };

  // Finish Test & Open Result Modal
  const handleFinishTest = () => {
    const passed = leftHasDrawn;
    setModalTab(passed ? 'success' : 'failure');
    setShowResultModal(true);

    if (passed) {
      onCompleteMastery(pair.id);
      sounds.playMasterFanfare();
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#b32349', '#ff5e7e', '#ffd9dd', '#00658e', '#ffba3a'],
        });
      } catch {
        // Confetti fallback
      }
    }
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 md:px-8 py-6 md:py-8 flex flex-col gap-6">
      {/* Top Navigation & Stage Header (Matching Image 5) */}
      <div className="flex flex-col gap-4">
        {/* Back Link and Progress Stepper Tracker */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBackToPractice}
            className="inline-flex items-center gap-1.5 text-[#594143] hover:text-[#b32349] transition-colors text-xs md:text-sm font-bold group w-fit"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">
              arrow_back
            </span>
            <span>비교 학습으로 돌아가기</span>
          </button>

          {/* Stage Status Capsules */}
          <div className="flex items-center gap-2 p-1.5 rounded-full bg-[#e6e6ff]/80 backdrop-blur-md shadow-xs self-start sm:self-auto border border-[#e0bec1]/30">
            {leftHasDrawn ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white shadow-xs text-xs font-bold text-[#00658e]">
                <span className="material-symbols-outlined text-[15px]">check_circle</span>
                <span>1단계: {pair.leftChar.character} 작성 중 ✓</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-xs text-xs font-bold text-[#b32349]">
                <span className="w-2 h-2 rounded-full bg-[#ff5e7e] animate-pulse"></span>
                <span>1단계: {pair.leftChar.character} 테스트 중</span>
              </div>
            )}

            <span className="material-symbols-outlined text-[#8c7073] text-[16px]">
              chevron_right
            </span>

            {leftHasDrawn ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white shadow-xs text-xs font-bold text-[#b32349]">
                <span className="w-2 h-2 rounded-full bg-[#ff5e7e] animate-pulse"></span>
                <span>2단계: {pair.rightChar.character} 테스트 중</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#edecff] text-[#594143]/70 text-xs">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                <span>2단계: {pair.rightChar.character} 대기</span>
              </div>
            )}
          </div>
        </div>

        {/* Title and Subtitle Block */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#ffd9dd] text-[#400012] text-xs font-bold">
              STAGE 03
            </span>
            <span className="text-xs text-[#8c7073] font-bold tracking-wider uppercase">
              Blind Memory Stroke Challenge
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#181a2e] tracking-tight">
            가이드 없이 직접 써볼까요?
          </h1>
          <p className="text-sm md:text-base text-[#594143]">
            두 문자를 기억을 되살려 연속해서 써보세요.
          </p>
        </div>
      </div>

      {/* Main Split Layout (5:5 Workspace) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch w-full mb-4">
        {/* LEFT CARD: Active Test for 문자 A */}
        <div className="flex flex-col rounded-2xl bg-white p-5 md:p-6 shadow-sm border border-[#e0bec1]/40 relative overflow-hidden">
          {/* Top Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#ff5e7e]"></div>

          {/* Card Header */}
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#ffd9dd] text-[#910033] text-xs font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#b32349]"></span>
                {leftHasDrawn ? '1단계 작성 중' : '1단계 진행 중 (기억으로 쓰기)'}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-kana text-3xl font-black text-[#b32349]">
                {pair.leftChar.character}
              </span>
              <span className="text-xs font-bold text-[#594143] bg-[#edecff] px-2 py-0.5 rounded-lg">
                [{pair.leftChar.romaji} / {pair.leftChar.korean}]
              </span>
            </div>
          </div>

          {/* Pure Blind Canvas via KanaWritingCanvas with showTraceGuide=false */}
          <div className="w-full">
            <KanaWritingCanvas
              key={`blind-left-${pair.leftChar.character}`}
              kana={pair.leftChar}
              showTraceGuide={false}
              colorScheme="primary"
              resetKey={leftResetKey}
              onHasDrawnChange={handleLeftHasDrawn}
            />
          </div>

          {/* Left Card Bottom Action */}
          <div className="pt-3 flex items-center justify-between">
            <span className="text-xs text-[#594143]">
              상태: <strong>{leftHasDrawn ? '작성됨' : '미작성'}</strong> (총 {pair.leftChar.strokeCount}획)
            </span>
            <button
              type="button"
              onClick={() => {
                setLeftResetKey((p) => p + 1);
                setLeftHasDrawn(false);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f4f2ff] hover:bg-[#e6e6ff] text-[#594143] text-xs font-bold transition-all active:scale-95 shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              <span>지우고 다시 쓰기</span>
            </button>
          </div>
        </div>

        {/* RIGHT CARD: Locked State or Active for 문자 B */}
        <div className="flex flex-col rounded-2xl bg-white p-5 md:p-6 shadow-sm border border-[#e0bec1]/40 relative overflow-hidden">
          {/* Top Accent Bar */}
          <div
            className={`absolute top-0 left-0 right-0 h-1.5 ${
              leftHasDrawn ? 'bg-[#00658e]' : 'bg-[#e0e0fc]'
            }`}
          ></div>

          {/* Card Header */}
          <div
            className={`flex items-center justify-between pb-3 transition-opacity ${
              leftHasDrawn ? 'opacity-100' : 'opacity-60'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#edecff] text-[#594143] text-xs font-bold flex items-center gap-1.5">
                {leftHasDrawn ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00658e]"></span>
                    <span>2단계 진행 중 (비교해 쓰기)</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                    <span>2단계 잠김 (왼쪽 {pair.leftChar.character} 완료 후 시작)</span>
                  </>
                )}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`font-kana text-3xl font-black ${
                  leftHasDrawn ? 'text-[#00658e]' : 'text-[#8c7073]'
                }`}
              >
                {pair.rightChar.character}
              </span>
              <span className="text-xs font-bold text-[#594143] bg-[#edecff] px-2 py-0.5 rounded-lg">
                [{pair.rightChar.romaji} / {pair.rightChar.korean}]
              </span>
            </div>
          </div>

          {/* Pure Blind Canvas for Right Character */}
          <div className="w-full">
            <KanaWritingCanvas
              key={`blind-right-${pair.rightChar.character}`}
              kana={pair.rightChar}
              isLocked={!leftHasDrawn}
              lockOverlayTitle={`${pair.rightChar.character} 테스트 대기 중`}
              lockOverlayDesc={`왼쪽 ${pair.leftChar.character}를 먼저 작성하면 잠금이 해제되고 직접 쓸 수 있습니다.`}
              onSimulateUnlock={() => setLeftHasDrawn(true)}
              showTraceGuide={false}
              colorScheme="secondary"
              resetKey={rightResetKey}
              onHasDrawnChange={handleRightHasDrawn}
            />
          </div>

          {/* Right Card Bottom Action */}
          <div className="pt-3 flex items-center justify-between">
            <span className="text-xs text-[#594143]">
              상태: <strong>{rightHasDrawn ? '작성됨' : '미작성'}</strong> (총 {pair.rightChar.strokeCount}획)
            </span>
            <button
              type="button"
              disabled={!leftHasDrawn}
              onClick={() => {
                setRightResetKey((p) => p + 1);
                setRightHasDrawn(false);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                leftHasDrawn
                  ? 'bg-[#f4f2ff] hover:bg-[#e6e6ff] text-[#594143] active:scale-95'
                  : 'bg-[#f4f2ff]/50 text-[#594143]/40 cursor-not-allowed'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              <span>지우고 다시 쓰기</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar (Matching Image 5) */}
      <div className="flex items-center justify-center gap-4 py-4 w-full">
        {/* Reset Entire Attempt Button */}
        <button
          type="button"
          onClick={handleResetAll}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#edecff] hover:bg-[#e0e0fc] text-[#181a2e] text-sm font-bold transition-all active:scale-95 shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">refresh</span>
          <span>전체 다시 쓰기</span>
        </button>

        {/* Complete/Finish Test Button */}
        <button
          type="button"
          onClick={handleFinishTest}
          className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#b32349] hover:bg-[#910033] text-white text-sm font-bold transition-all active:scale-95 shadow-[0_4px_0_#910033]"
        >
          <span>테스트 종료</span>
          <span className="material-symbols-outlined text-[20px]">check</span>
        </button>
      </div>

      {/* Test Result Modal Overlay Container (Matching Image 9) */}
      {showResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#181a2e]/50 backdrop-blur-md transition-opacity duration-300">
          <div className="relative w-full max-w-[460px] bg-white rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center transition-all animate-in fade-in zoom-in-95 duration-200">
            {/* Top Review Status Switcher Tabs (Matching Image 9) */}
            <div className="flex items-center justify-between w-full mb-6 pb-3 border-b border-[#e0bec1]/30">
              <div className="inline-flex p-1 bg-[#f4f2ff] rounded-xl gap-1 border border-[#e0bec1]/20">
                <button
                  type="button"
                  onClick={() => setModalTab('success')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    modalTab === 'success'
                      ? 'bg-white text-[#b32349] shadow-sm'
                      : 'text-[#594143] hover:text-[#181a2e]'
                  }`}
                >
                  성공 화면
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('failure')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    modalTab === 'failure'
                      ? 'bg-white text-[#00658e] shadow-sm'
                      : 'text-[#594143] hover:text-[#181a2e]'
                  }`}
                >
                  실패 화면
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowResultModal(false)}
                className="p-1.5 rounded-lg text-[#594143] hover:bg-[#f4f2ff] transition-colors"
                title="모달 닫기"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Success State View */}
            {modalTab === 'success' ? (
              <div className="flex flex-col items-center w-full">
                {/* Coral Badge with Trophy Icon */}
                <div className="w-20 h-20 rounded-full bg-[#ffd9dd] flex items-center justify-center text-[#b32349] shadow-sm mb-5 relative">
                  <span className="material-symbols-outlined text-[44px]">emoji_events</span>
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#ff5e7e] text-white flex items-center justify-center shadow-xs">
                    <span className="material-symbols-outlined text-[14px]">star</span>
                  </div>
                </div>

                <h2 className="text-2xl md:text-3xl font-black text-[#181a2e] tracking-tight mb-2">
                  마스터!
                </h2>

                <p className="text-sm md:text-base text-[#594143] mb-8 leading-relaxed">
                  <span className="font-bold text-[#b32349]">{pair.leftChar.character}</span>와{' '}
                  <span className="font-bold text-[#b32349]">{pair.rightChar.character}</span>를 직접 써보며
                  구별했어요!
                </p>

                <div className="flex flex-col w-full gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowResultModal(false);
                      onBackToMain();
                    }}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#b32349] hover:bg-[#910033] text-white text-sm font-bold transition-all shadow-[0_4px_0_#910033] active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>다른 문자 연습하기</span>
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowResultModal(false);
                      handleResetAll();
                    }}
                    className="w-full py-3 px-6 rounded-xl bg-[#f4f2ff] hover:bg-[#e6e6ff] text-[#181a2e] text-sm font-semibold transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">replay</span>
                    <span>한 번 더 테스트하기</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Failure State View */
              <div className="flex flex-col items-center w-full">
                {/* Warm Encouragement Icon */}
                <div className="w-20 h-20 rounded-full bg-[#f4f2ff] flex items-center justify-center text-[#00658e] shadow-sm mb-5">
                  <span className="material-symbols-outlined text-[40px]">edit_note</span>
                </div>

                <h2 className="text-2xl md:text-3xl font-black text-[#181a2e] tracking-tight mb-2">
                  조금만 더 연습해볼까요?
                </h2>

                <p className="text-sm md:text-base text-[#594143] mb-8 leading-relaxed max-w-[320px]">
                  직접 써보면서 두 문자의 차이점을 다시 한 번 확인해보세요.
                </p>

                <div className="flex flex-col w-full gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowResultModal(false);
                      onBackToPractice();
                    }}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#b32349] hover:bg-[#910033] text-white text-sm font-bold transition-all shadow-[0_4px_0_#910033] active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[20px]">menu_book</span>
                    <span>다시 연습하기</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowResultModal(false);
                      handleResetAll();
                    }}
                    className="w-full py-3 px-6 rounded-xl bg-[#f4f2ff] hover:bg-[#e6e6ff] text-[#181a2e] text-sm font-semibold transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">replay</span>
                    <span>테스트 다시 하기</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
