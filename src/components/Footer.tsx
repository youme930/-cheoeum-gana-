import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#f4f2ff]/80 py-5 mt-auto border-t border-[#e0bec1]/30">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left text-xs md:text-sm text-[#594143]">
        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[#b32349]">처음가나</span>
            <span className="hidden sm:inline text-[#8c7073]">•</span>
            <span>손끝 감각으로 깨치는 일본어 문자 훈련소</span>
          </div>
          <span className="text-[#8c7073] text-[12px] hidden lg:inline">
            (헷갈리는 가나 문자를 1:1 비교로 확실하게 익혀보세요)
          </span>
        </div>
        <p className="text-[#8c7073]">
          © 2024 처음가나 (Cheo-eum Kana). 누구나 부담 없이 시작하는 쉬운 글씨 연습.
        </p>
      </div>
    </footer>
  );
};
