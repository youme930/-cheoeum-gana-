import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MainSelectionView } from './components/MainSelectionView';
import { ComparisonPracticeView } from './components/ComparisonPracticeView';
import { BlindTestView } from './components/BlindTestView';
import { ConfusionQuizModal } from './components/ConfusionQuizModal';
import { LearningTipsModal } from './components/LearningTipsModal';
import { GlyphInspectionModal } from './components/GlyphInspectionModal';
import { KANA_PAIRS } from './data/kanaPairs';
import { AppView, KanaPair, UserProgress } from './types/kana';

const STORAGE_KEY = 'cheoeum_kana_progress_v3';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('main');
  const [selectedPair, setSelectedPair] = useState<KanaPair>(KANA_PAIRS[0]);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isTipsOpen, setIsTipsOpen] = useState(false);
  const [isGlyphInspectionOpen, setIsGlyphInspectionOpen] = useState(false);

  // User progress persistence
  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {
        // Fallback to default
      }
    }
    return {
      completedPairs: {
        nu_me: true,
        re_wa: true,
      },
      practicedPairs: {
        nu_me: true,
        shi_tsu: true,
        re_wa: true,
      },
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userProgress));
    } catch {
      // LocalStorage error ignore
    }
  }, [userProgress]);

  // Mark pair as practiced
  const handleMarkPracticed = (pairId: string) => {
    setUserProgress((prev) => ({
      ...prev,
      practicedPairs: {
        ...prev.practicedPairs,
        [pairId]: true,
      },
    }));
  };

  // Mark pair as mastered
  const handleCompleteMastery = (pairId: string) => {
    setUserProgress((prev) => ({
      ...prev,
      completedPairs: {
        ...prev.completedPairs,
        [pairId]: true,
      },
      practicedPairs: {
        ...prev.practicedPairs,
        [pairId]: true,
      },
    }));
  };

  // Navigation handlers
  const handleSelectPair = (pair: KanaPair) => {
    setSelectedPair(pair);
    setCurrentView('practice');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDirectTest = (pair: KanaPair) => {
    setSelectedPair(pair);
    setCurrentView('blind_test');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPairById = (pairId: string) => {
    const found = KANA_PAIRS.find((p) => p.id === pairId);
    if (found) {
      handleSelectPair(found);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf8ff] text-[#181a2e] font-sans antialiased selection:bg-[#ffd9dd] selection:text-[#910033]">
      {/* Top Header */}
      <Header
        currentView={currentView}
        currentPair={selectedPair}
        onNavigateHome={() => setCurrentView('main')}
        onOpenQuiz={() => setIsQuizOpen(true)}
        onOpenTips={() => setIsTipsOpen(true)}
        onOpenGlyphInspection={() => setIsGlyphInspectionOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full pt-16 md:pt-20">
        {currentView === 'main' && (
          <MainSelectionView
            pairs={KANA_PAIRS}
            userProgress={userProgress}
            onSelectPair={handleSelectPair}
            onDirectTest={handleDirectTest}
            onOpenGlyphInspection={() => setIsGlyphInspectionOpen(true)}
          />
        )}

        {currentView === 'practice' && (
          <ComparisonPracticeView
            pair={selectedPair}
            onBackToMain={() => setCurrentView('main')}
            onProceedToBlindTest={() => setCurrentView('blind_test')}
            onMarkPracticed={handleMarkPracticed}
          />
        )}

        {currentView === 'blind_test' && (
          <BlindTestView
            pair={selectedPair}
            onBackToPractice={() => setCurrentView('practice')}
            onBackToMain={() => setCurrentView('main')}
            onCompleteMastery={handleCompleteMastery}
          />
        )}
      </main>

      {/* Modals */}
      <ConfusionQuizModal isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />

      <LearningTipsModal
        isOpen={isTipsOpen}
        onClose={() => setIsTipsOpen(false)}
        onSelectPair={handleSelectPairById}
      />

      {/* 10 Glyph Unicode Inspection Room Modal */}
      <GlyphInspectionModal
        isOpen={isGlyphInspectionOpen}
        onClose={() => setIsGlyphInspectionOpen(false)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
