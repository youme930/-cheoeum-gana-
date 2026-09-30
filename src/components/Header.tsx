import React from 'react';
import { AppView, KanaPair } from '../types/kana';

interface HeaderProps {
  currentView: AppView;
  currentPair: KanaPair | null;
  onNavigateHome: () => void;
  onSelectCategory?: (type: 'all' | 'hiragana' | 'katakana') => void;
  onOpenQuiz: () => void;
  onOpenTips: () => void;
  onOpenGlyphInspection: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigateHome,
  onOpenQuiz,
  onOpenTips,
  onOpenGlyphInspection,
}) => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#fbf8ff]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(43,45,66,0.05)] border-b border-[#e0bec1]/20">
      <div className="h-16 md:h-20 max-w-[1280px] mx-auto px-4 md:px-8 flex items-center justify-between gap-4">
        {/* Left Brand / Back Button */}
        <div className="flex items-center gap-3 md:gap-4">
          {currentView !== 'main' ? (
            <button
              onClick={onNavigateHome}
              type="button"
              className="group inline-flex items-center gap-1.5 px-3 py-1.5 md:py-2 rounded-lg bg-[#f4f2ff] hover:bg-[#e6e6ff] text-[#594143] hover:text-[#181a2e] transition-all text-xs md:text-sm font-bold shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">
                arrow_back
              </span>
              <span>{currentView === 'blind_test' ? '학습으로 돌아가기' : '메인으로 돌아가기'}</span>
            </button>
          ) : null}

          {currentView !== 'main' && (
            <div className="h-4 w-[1px] bg-[#e0bec1]/60 hidden sm:block"></div>
          )}

          <div
            onClick={onNavigateHome}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#ffd9dd] flex items-center justify-center shadow-sm">
              <span className="w-3 h-3 rounded-full bg-[#b32349] animate-pulse"></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl md:text-2xl font-black text-[#b32349] tracking-tight">
                처음가나
              </span>
              {currentView === 'main' && (
                <span className="px-2 py-0.5 rounded-full bg-[#c7e7ff] text-[#001e2e] text-[11px] font-bold">
                  베타
                </span>
              )}
            </div>
          </div>

          {currentView === 'blind_test' && (
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-[#ffd9dd] text-[#400012] text-xs font-semibold select-none">
              블라인드 테스트 모드
            </span>
          )}

          {currentView === 'main' && (
            <span className="text-xs text-[#594143] hidden xl:inline-block border-l border-[#e0bec1]/40 pl-3">
              헷갈리는 닮은꼴 문자, 손끝으로 기억하다
            </span>
          )}
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#f4f2ff] px-2 py-1 rounded-full text-xs md:text-sm font-semibold text-[#594143]">
          <button
            onClick={onNavigateHome}
            type="button"
            className={`px-3 py-1.5 rounded-full transition-colors ${
              currentView === 'main'
                ? 'bg-[#ffffff] text-[#b32349] font-bold shadow-sm'
                : 'hover:text-[#181a2e]'
            }`}
          >
            문자 쌍 학습
          </button>
          <button
            onClick={onOpenGlyphInspection}
            type="button"
            className="px-3 py-1.5 rounded-full hover:text-[#2563eb] text-[#1d4ed8] bg-[#dbeafe] hover:bg-[#bfdbfe] transition-colors flex items-center gap-1 font-bold"
          >
            <span className="material-symbols-outlined text-[16px] text-[#2563eb]">draw</span>
            <span>10자 직접 쓰기 연습실</span>
          </button>
          <button
            onClick={onOpenTips}
            type="button"
            className="px-3 py-1.5 rounded-full hover:text-[#181a2e] transition-colors"
          >
            학습 팁 & 차이점
          </button>
          <button
            onClick={onOpenQuiz}
            type="button"
            className="px-3 py-1.5 rounded-full hover:text-[#181a2e] transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px] text-[#00658e]">quiz</span>
            <span>헷갈림 퀴즈</span>
          </button>
        </nav>

        {/* Right User Indicator */}
        <div className="flex items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={onOpenGlyphInspection}
            className="md:hidden flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#c7e7ff] text-[#004c6c] text-xs font-bold"
            title="10자 밑그림 검수"
          >
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>검수실</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f4f2ff] text-xs font-medium text-[#594143] border border-[#e0bec1]/30">
            <span className="w-2 h-2 rounded-full bg-[#c88b00] animate-pulse"></span>
            <span>무가입 즉시 연습중</span>
          </div>

          <div
            className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#b32349] flex items-center justify-center text-white shadow-sm ring-2 ring-[#ffd9dd]"
            title="학습자 프로필"
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
};
