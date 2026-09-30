import React, { useState } from 'react';
import { KanaPair, UserProgress } from '../types/kana';
import { sounds } from '../utils/audio';

interface MainSelectionViewProps {
  pairs: KanaPair[];
  userProgress: UserProgress;
  onSelectPair: (pair: KanaPair) => void;
  onDirectTest: (pair: KanaPair) => void;
  onOpenGlyphInspection: () => void;
}

export const MainSelectionView: React.FC<MainSelectionViewProps> = ({
  pairs,
  userProgress,
  onSelectPair,
  onOpenGlyphInspection,
}) => {
  const [filter, setFilter] = useState<'all' | 'hiragana' | 'katakana'>('all');

  const filteredPairs = pairs.filter((pair) => {
    if (filter === 'all') return true;
    return pair.type === filter;
  });

  const masteredCount = pairs.filter((p) => userProgress.completedPairs[p.id]).length;
  const inProgressCount = pairs.filter(
    (p) => userProgress.practicedPairs[p.id] && !userProgress.completedPairs[p.id]
  ).length;

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 md:px-8 py-8 md:py-12">
      {/* Ambient background glows */}
      <div className="relative">
        <div className="absolute -top-12 left-1/4 w-96 h-96 rounded-full bg-[#ffd9dd] opacity-30 blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute top-20 right-10 w-80 h-80 rounded-full bg-[#c7e7ff] opacity-35 blur-3xl pointer-events-none -z-10"></div>

        {/* Section 1: Hero */}
        <section className="w-full mb-8 md:mb-12 text-center max-w-3xl mx-auto pt-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#ffd9dd] text-[#400012] mb-4 shadow-sm">
            <span className="material-symbols-outlined text-[18px]">edit_note</span>
            <span className="text-xs font-bold tracking-wide uppercase">
              손끝 기억 감각 훈련소
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-[#181a2e] tracking-tight mb-4 leading-tight">
            헷갈리는 닮은꼴 문자,
            <br />
            <span className="text-[#b32349] underline decoration-[#ffb2bb] decoration-4 underline-offset-8">
              눈으로 보지 말고 직접 써 보세요!
            </span>
          </h1>

          <p className="text-base md:text-lg text-[#594143] leading-relaxed max-w-2xl mx-auto">
            회원가입 없이 즉시 시작하는 1:1 좌우 비교 실시간 교정 트레이닝.
            <br className="hidden sm:inline" />
            헷갈리는 문자를 손끝으로 비교하며 올바른 획순을 체득해보세요.
          </p>

          {/* Quick Stats & Verification Link Banner */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex flex-wrap items-center justify-center gap-3 bg-[#f4f2ff] px-4 py-2 rounded-2xl border border-[#e0bec1]/40 text-xs sm:text-sm text-[#181a2e]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#b32349]"></span>
                <span>총 <strong>5개 혼동 세트 (10자)</strong></span>
              </div>
              <span className="text-[#8c7073]">•</span>
              <div className="flex items-center gap-1.5 text-[#7e5700]">
                <span className="material-symbols-outlined text-[16px]">stars</span>
                <span>마스터 완료: <strong>{masteredCount}</strong> / 5</span>
              </div>
              {inProgressCount > 0 && (
                <>
                  <span className="text-[#8c7073]">•</span>
                  <div className="flex items-center gap-1.5 text-[#00658e]">
                    <span className="w-2 h-2 rounded-full bg-[#00658e] animate-pulse"></span>
                    <span>학습 진행 중: <strong>{inProgressCount}</strong></span>
                  </div>
                </>
              )}
            </div>

            {/* Direct Free Writing Practice Studio Button */}
            <button
              type="button"
              onClick={onOpenGlyphInspection}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#dbeafe] hover:bg-[#bfdbfe] text-[#1d4ed8] text-xs sm:text-sm font-bold border border-[#2563eb]/30 transition-all active:scale-95 shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">draw</span>
              <span>10글자 직접 쓰기 연습실 열기 (자유 필기 모드)</span>
            </button>
          </div>
        </section>

        {/* Section 2: Core 5 Confusing Kana Pairs Card Grid */}
        <section className="w-full mb-12">
          {/* Header & Filter Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-[#ffd9dd] text-[#400012] text-xs font-bold">
                  1:1 맞춤 집중 훈련
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#181a2e] tracking-tight">
                학습할 문자 쌍 선택
              </h2>
              <p className="text-sm md:text-base text-[#594143] mt-1">
                원어민도 헷갈리는 대표 쌍을 선택해 1:1 좌우 분할 쓰기 훈련을 시작하세요.
              </p>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center p-1 rounded-full bg-[#f4f2ff] shadow-sm shrink-0 self-start sm:self-auto border border-[#e0bec1]/30">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  filter === 'all'
                    ? 'bg-white text-[#b32349] shadow-sm'
                    : 'text-[#594143] hover:text-[#181a2e]'
                }`}
              >
                전체 5쌍
              </button>
              <button
                type="button"
                onClick={() => setFilter('hiragana')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  filter === 'hiragana'
                    ? 'bg-white text-[#b32349] shadow-sm'
                    : 'text-[#594143] hover:text-[#181a2e]'
                }`}
              >
                히라가나 (3)
              </button>
              <button
                type="button"
                onClick={() => setFilter('katakana')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  filter === 'katakana'
                    ? 'bg-white text-[#b32349] shadow-sm'
                    : 'text-[#594143] hover:text-[#181a2e]'
                }`}
              >
                가타카나 (2)
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPairs.map((pair) => {
              const isMastered = !!userProgress.completedPairs[pair.id];
              const isPracticed = !!userProgress.practicedPairs[pair.id];
              const isTopAccent = isMastered
                ? 'bg-[#7e5700]'
                : isPracticed
                ? 'bg-[#00658e]'
                : 'bg-[#e0bec1]';

              return (
                <div
                  key={pair.id}
                  className="flex flex-col justify-between p-6 rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 relative group overflow-hidden border border-[#e0bec1]/40"
                >
                  {/* Card top accent bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${isTopAccent}`}></div>

                  <div>
                    {/* Header badge & status */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-2.5 py-1 rounded-full bg-[#edecff] text-[#181a2e] text-xs font-bold">
                        {pair.type === 'hiragana' ? '히라가나' : '가타카나'} 쌍 {pair.pairNumber}
                      </span>

                      {isMastered ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#ffdead] text-[#281900] text-xs font-extrabold shadow-sm">
                          <span className="material-symbols-outlined text-[16px] text-[#7e5700]">
                            stars
                          </span>
                          <span>마스터 완료 ★</span>
                        </span>
                      ) : isPracticed ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c7e7ff] text-[#001e2e] text-xs font-extrabold shadow-sm">
                          <span className="w-2 h-2 rounded-full bg-[#00658e] animate-pulse"></span>
                          <span>학습 중</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#e6e6ff] text-[#594143] text-xs font-bold">
                          <span className="w-2 h-2 rounded-full bg-[#8c7073]"></span>
                          <span>시작 전</span>
                        </span>
                      )}
                    </div>

                    {/* Glyph Pair Display Box */}
                    <div className="flex items-center justify-center gap-5 py-4 mb-4 bg-[#f4f2ff] rounded-xl relative">
                      {/* Left Kana */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          sounds.speakKana(pair.leftChar.audioText);
                        }}
                        className="text-center group/btn cursor-pointer p-2 rounded-lg hover:bg-white/80 transition-colors"
                        title={`${pair.leftChar.character} 발음 듣기`}
                      >
                        <span className="font-kana text-5xl md:text-6xl text-[#b32349] block font-black leading-tight group-hover/btn:scale-105 transition-transform">
                          {pair.leftChar.character}
                        </span>
                        <div className="flex items-center justify-center gap-1 text-xs text-[#594143] font-bold mt-1">
                          <span>{pair.leftChar.romaji} ({pair.leftChar.korean})</span>
                          <span className="material-symbols-outlined text-[13px] text-[#8c7073] group-hover/btn:text-[#b32349]">
                            volume_up
                          </span>
                        </div>
                      </div>

                      {/* VS divider */}
                      <div className="flex flex-col items-center">
                        <span className="text-[11px] text-[#8c7073] font-extrabold px-2.5 py-1 rounded-full bg-[#edecff] border border-[#e0bec1]/40 shadow-xs">
                          VS
                        </span>
                      </div>

                      {/* Right Kana */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          sounds.speakKana(pair.rightChar.audioText);
                        }}
                        className="text-center group/btn cursor-pointer p-2 rounded-lg hover:bg-white/80 transition-colors"
                        title={`${pair.rightChar.character} 발음 듣기`}
                      >
                        <span className="font-kana text-5xl md:text-6xl text-[#00658e] block font-black leading-tight group-hover/btn:scale-105 transition-transform">
                          {pair.rightChar.character}
                        </span>
                        <div className="flex items-center justify-center gap-1 text-xs text-[#594143] font-bold mt-1">
                          <span>{pair.rightChar.romaji} ({pair.rightChar.korean})</span>
                          <span className="material-symbols-outlined text-[13px] text-[#8c7073] group-hover/btn:text-[#00658e]">
                            volume_up
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Key Difference Tag */}
                    <div className="p-3 rounded-xl bg-[#edecff]/80 mb-5 flex items-start gap-2.5 border border-[#e0bec1]/20">
                      <span className="material-symbols-outlined text-[#b32349] text-[18px] shrink-0 mt-0.5">
                        {pair.id === 'nu_me' ? 'lightbulb' : pair.id === 'shi_tsu' ? 'compare_arrows' : pair.id === 're_wa' ? 'turn_sharp_right' : pair.id === 'so_n' ? 'north_east' : 'radio_button_checked'}
                      </span>
                      <p className="text-xs text-[#181a2e] leading-snug">
                        구별 포인트:{' '}
                        <strong className="text-[#b32349] font-bold">
                          {pair.differencePoint}
                        </strong>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectPair(pair)}
                      className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 active:scale-98 ${
                        isMastered
                          ? 'bg-[#edecff] text-[#b32349] hover:bg-[#b32349] hover:text-white'
                          : isPracticed
                          ? 'bg-[#00658e] text-white hover:bg-[#005072]'
                          : 'bg-[#ff5e7e] text-white hover:bg-[#b32349]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {isMastered ? 'replay' : isPracticed ? 'play_arrow' : 'draw'}
                      </span>
                      <span>
                        {isMastered
                          ? '다시 복습하기'
                          : isPracticed
                          ? '이어서 학습하기'
                          : '학습 시작하기'}
                      </span>
                    </button>

                    <div className="text-center text-[11px] text-[#8c7073]">
                      소요 시간: 약 {pair.estimatedMinutes}분
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
