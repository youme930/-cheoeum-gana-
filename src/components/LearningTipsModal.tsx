import React from 'react';
import { KANA_PAIRS } from '../data/kanaPairs';
import { sounds } from '../utils/audio';

interface LearningTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPair: (pairId: string) => void;
}

export const LearningTipsModal: React.FC<LearningTipsModalProps> = ({
  isOpen,
  onClose,
  onSelectPair,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#181a2e]/50 backdrop-blur-md">
      <div className="relative w-full max-w-[650px] max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-6 flex flex-col gap-5 border border-[#e0bec1]/40">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e0bec1]/30 pb-3 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#b32349] text-[22px]">
              menu_book
            </span>
            <span className="font-extrabold text-[#181a2e] text-lg">
              닮은꼴 문자 5쌍 1초 구별 비법서
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

        {/* Introduction */}
        <p className="text-xs md:text-sm text-[#594143] leading-relaxed bg-[#f4f2ff] p-3.5 rounded-xl border border-[#e0bec1]/20">
          💡 일본어 입문 시 가장 오답률이 높은 5쌍의 문자입니다. 눈으로 외우지 않고 획을 긋는{' '}
          <strong>방향과 끝맺음</strong>으로 기억하면 절대 헷갈리지 않습니다.
        </p>

        {/* 5 Pairs Comparison Cards */}
        <div className="flex flex-col gap-4">
          {KANA_PAIRS.map((pair) => (
            <div
              key={pair.id}
              className="p-4 rounded-xl border border-[#e0bec1]/40 bg-[#fbf8ff] flex flex-col gap-3 hover:border-[#b32349]/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-[#edecff] text-[#181a2e] text-[11px] font-bold">
                    쌍 {pair.pairNumber}
                  </span>
                  <span className="text-sm font-extrabold text-[#181a2e]">{pair.title}</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectPair(pair.id);
                  }}
                  className="px-3 py-1 rounded-lg bg-[#b32349] hover:bg-[#910033] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                >
                  <span>연습실</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>

              {/* Side-by-side Kana Box */}
              <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-[#e0bec1]/20">
                {/* Left */}
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => sounds.speakKana(pair.leftChar.audioText)}
                    className="cursor-pointer w-12 h-12 rounded-xl bg-[#ffd9dd]/60 hover:bg-[#ffd9dd] flex items-center justify-center text-[#b32349] font-kana text-3xl font-black transition-colors"
                    title="발음 듣기"
                  >
                    {pair.leftChar.character}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#181a2e]">
                      {pair.leftChar.romaji} ({pair.leftChar.korean})
                    </span>
                    <span className="text-[11px] text-[#b32349] font-medium leading-tight">
                      {pair.leftChar.distinctionFeature}
                    </span>
                  </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-3 border-l border-[#e0bec1]/30 pl-3">
                  <div
                    onClick={() => sounds.speakKana(pair.rightChar.audioText)}
                    className="cursor-pointer w-12 h-12 rounded-xl bg-[#c7e7ff]/60 hover:bg-[#c7e7ff] flex items-center justify-center text-[#00658e] font-kana text-3xl font-black transition-colors"
                    title="발음 듣기"
                  >
                    {pair.rightChar.character}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#181a2e]">
                      {pair.rightChar.romaji} ({pair.rightChar.korean})
                    </span>
                    <span className="text-[11px] text-[#00658e] font-medium leading-tight">
                      {pair.rightChar.distinctionFeature}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detail explanation */}
              <p className="text-xs text-[#594143] leading-snug">
                🎯 <strong>핵심 요약:</strong> {pair.differenceDetail}
              </p>
            </div>
          ))}
        </div>

        {/* Footer Close Button */}
        <div className="pt-2 sticky bottom-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-[#f4f2ff] hover:bg-[#e6e6ff] text-[#181a2e] text-xs font-bold transition-all"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
