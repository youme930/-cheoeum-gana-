export type KanaType = 'hiragana' | 'katakana';

export interface StrokePoint {
  x: number; // 0 ~ 400 normalized coordinate system
  y: number;
}

export interface StrokeGuide {
  index: number;
  label: string; // e.g. "1획", "2획"
  instruction: string;
  path: string; // Accurate SVG path matching the actual Japanese stroke curvature
  startPoint: StrokePoint; // Precise start coordinate
  endPoint: StrokePoint;   // Precise end coordinate
  direction: string;       // Descriptive direction, e.g. "위에서 비스듬히 아래로", "아래에서 위로 올려치기"
  numberPos?: StrokePoint; // Coordinate for stroke number circle
}

export interface KanaCharacter {
  character: string; // Unicode character itself (e.g. "ぬ")
  reading: string;   // e.g. "nu (누)"
  romaji: string;
  korean: string;
  strokeCount: number;
  strokes: StrokeGuide[];
  tipText: string;
  distinctionFeature: string;
  audioText: string;
}

export interface KanaPair {
  id: string; // 'nu_me', 'shi_tsu', 're_wa', 'so_n', 'a_o'
  pairNumber: string; // '01', '02', '03', '04', '05'
  type: KanaType;
  title: string; // "ぬ와 め를 비교해서 써볼까요?"
  subtitle: string; // "꼬리 유무 비교 세트"
  categoryLabel: string; // "히라가나 혼동 모음집"
  leftChar: KanaCharacter;
  rightChar: KanaCharacter;
  differencePoint: string; // "돼지꼬리 끝맺음 유무"
  differenceDetail: string; // "め는 ぬ와 획순과 뼈대가 같지만, 마지막에 꼬리 매듭이 전혀 없습니다."
  accentColor?: string;
  estimatedMinutes: number;
}

export type AppView = 'main' | 'practice' | 'blind_test';

export interface UserProgress {
  completedPairs: Record<string, boolean>; // pairId -> isMastered
  practicedPairs: Record<string, boolean>; // pairId -> hasPracticed
}
