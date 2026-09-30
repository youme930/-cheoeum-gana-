import React, { useState } from 'react';
import { KANA_CHARACTERS } from '../data/kanaPairs';
import { KanaWritingCanvas } from './KanaWritingCanvas';
import { sounds } from '../utils/audio';

interface GlyphInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCharacter?: (char: string) => void;
}

export const GlyphInspectionModal: React.FC<GlyphInspectionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'hiragana' | 'katakana'>('all');
  const [resetKeys, setResetKeys] = useState<Record<string, number>>({});

  if (!isOpen) return null;

  const characters = Object.values(KANA_CHARACTERS).filter((item) => {
    if (activeTab === 'hiragana') return ['ぬ', 'め', 'れ', 'わ', 'あ', 'お'].includes(item.character);
    if (activeTab === 'katakana') return ['シ', 'ツ', 'ソ', 'ン'].includes(item.character);
    return true;
  });

  const handleResetCharacter = (char: string) => {
    setResetKeys((prev) => ({
      ...prev,
      [char]: (prev[char] || 0) + 1,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-[#181a2e]/65 backdrop-blur-md">
      <div className="relative w-full max-w-[1260px] max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#e0bec1]/40">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e0bec1]/30 flex flex-wrap items-center justify-between gap-3 bg-[#fbf8ff]">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#2563eb] animate-pulse"></span>
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-[#181a2e] flex items-center gap-2">
                <span>10개 일본어 문자 직접 쓰기 연습실</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#c7e7ff] text-[#001e2e] font-bold">
                  자유 필기 모드
                </span>
              </h2>
              <p className="text-xs text-[#594143] mt-0.5">
                표준 일본어 폰트 밑그림 위에 마우스나 손가락으로 파란색 선을 직접 자유롭게 써보세요.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Buttons */}
            <div className="flex items-center p-1 rounded-full bg-[#edecff] text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 rounded-full transition-all ${
                  activeTab === 'all' ? 'bg-white text-[#b32349] shadow-xs' : 'text-[#594143]'
                }`}
              >
                전체 10자
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('hiragana')}
                className={`px-3 py-1 rounded-full transition-all ${
                  activeTab === 'hiragana' ? 'bg-white text-[#b32349] shadow-xs' : 'text-[#594143]'
                }`}
              >
                히라가나 (6)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('katakana')}
                className={`px-3 py-1 rounded-full transition-all ${
                  activeTab === 'katakana' ? 'bg-white text-[#b32349] shadow-xs' : 'text-[#594143]'
                }`}
              >
                가타카나 (4)
              </button>
            </div>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[#594143] hover:bg-[#f4f2ff] transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>
        </div>

        {/* Scrollable Inspection Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#f4f2ff]/60">
          <div className="mb-5 p-3.5 bg-white rounded-2xl border border-slate-200 flex items-center justify-between text-xs text-[#594143]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2563eb] text-[20px]">draw</span>
              <span>
                10개 문자(<strong>ぬ, め, れ, わ, あ, お, シ, ツ, ソ, ン</strong>)의 밑그림 위에 마우스/터치로 직접 글씨를 써보며 문자의 필감을 익혀보세요.
              </span>
            </div>
            <span className="font-bold text-[#2563eb] shrink-0">※ 파란색 실시간 자유 쓰기 지원</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {characters.map((item) => {
              const resetKey = resetKeys[item.character] || 0;

              return (
                <div
                  key={item.character}
                  className="flex flex-col bg-white rounded-2xl p-4 shadow-sm border border-[#e0bec1]/40 hover:shadow-md transition-shadow"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-kana text-2xl font-black text-[#b32349]">
                        {item.character}
                      </span>
                      <span className="text-xs font-bold text-[#181a2e]">[{item.reading}]</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#f4f2ff] text-[#594143] font-bold">
                        총 {item.strokeCount}획
                      </span>
                      <button
                        type="button"
                        onClick={() => sounds.speakKana(item.audioText)}
                        className="p-1 rounded-lg text-[#00658e] hover:bg-[#c7e7ff]/40"
                        title="발음 듣기"
                      >
                        <span className="material-symbols-outlined text-[17px]">volume_up</span>
                      </button>
                    </div>
                  </div>

                  {/* 3-Layer KanaWritingCanvas Component for Direct Writing */}
                  <div className="w-full">
                    <KanaWritingCanvas
                      kana={item}
                      showTraceGuide={true}
                      resetKey={resetKey}
                      colorScheme="primary"
                    />
                  </div>

                  {/* Clear / Redo Button */}
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleResetCharacter(item.character)}
                      className="flex-1 py-1.5 px-3 bg-[#f4f2ff] hover:bg-[#e6e6ff] text-[#181a2e] text-xs font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1 border border-slate-200"
                    >
                      <span className="material-symbols-outlined text-[15px]">refresh</span>
                      <span>지우고 다시 쓰기</span>
                    </button>
                  </div>

                  {/* Character Distinction Feature Hint */}
                  <div className="mt-2 p-2 rounded-xl bg-[#edecff]/60 text-[11px] text-[#181a2e] leading-snug min-h-[46px] flex flex-col justify-center">
                    <div>
                      <span className="font-bold text-[#00658e]">특징: </span>
                      <span>{item.distinctionFeature}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#e0bec1]/30 bg-[#fbf8ff] flex items-center justify-between text-xs text-[#594143]">
          <span>
            총 <strong>10개</strong> 일본어 문자 자유 쓰기 모드. 밑그림 위를 마우스나 손가락으로 드래그하면 파란색 선이 바로 그려집니다.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#b32349] hover:bg-[#910033] text-white font-bold transition-all shadow-xs"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
