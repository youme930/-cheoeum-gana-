import { StrokeGuide } from '../types/kana';

export interface ValidationResult {
  ok: boolean;
  reason?: string;
  feedbackType?: 'start_pos' | 'direction' | 'length' | 'order' | 'success';
}

/**
 * Validates a user-drawn stroke against the expected StrokeGuide data.
 * Coordinates in userPoints are in 800x800 internal canvas space.
 * KanjiVG stroke points are in 109x109 space.
 */
export function validateStroke(
  character: string,
  expectedStrokeIndex: number,
  userPoints800: Array<{ x: number; y: number }>,
  strokeGuide: StrokeGuide
): ValidationResult {
  if (!userPoints800 || userPoints800.length < 2) {
    return {
      ok: false,
      reason: '선을 이어서 그어주세요.',
      feedbackType: 'length',
    };
  }

  // Convert user points from 800x800 space to 109x109 space for direct comparison with KanjiVG
  const points109 = userPoints800.map((p) => ({
    x: (p.x / 800) * 109,
    y: (p.y / 800) * 109,
  }));

  const startPoint = points109[0];
  const endPoint = points109[points109.length - 1];

  // Calculate total drawn path length in 109 space
  let totalLength = 0;
  for (let i = 1; i < points109.length; i++) {
    totalLength += Math.hypot(
      points109[i].x - points109[i - 1].x,
      points109[i].y - points109[i - 1].y
    );
  }

  // Minimum length check (prevent accidental clicks / taps)
  if (totalLength < 10) {
    return {
      ok: false,
      reason: '너무 짧습니다. 선을 끝까지 그어주세요.',
      feedbackType: 'length',
    };
  }

  // Distance from user start to expected startPoint
  const startDist = Math.hypot(
    startPoint.x - strokeGuide.startPoint.x,
    startPoint.y - strokeGuide.startPoint.y
  );

  // Maximum allowed start position deviation in 109 space (~185px in 800 space)
  const maxStartDist = 26;

  // Character-specific custom validation rules (starting with 'ぬ')
  if (character === 'ぬ') {
    if (expectedStrokeIndex === 1) {
      // ぬ 1획: Starts top-left (25.38, 28.5) and slants down-right (44.14, 81.51)
      if (startDist > maxStartDist) {
        return {
          ok: false,
          reason: '1획 시작 위치(좌상단 ①)를 확인해 주세요.',
          feedbackType: 'start_pos',
        };
      }

      const dy = endPoint.y - startPoint.y;
      if (dy <= 8) {
        return {
          ok: false,
          reason: '위에서 아래 방향으로 비스듬히 그어주세요.',
          feedbackType: 'direction',
        };
      }

      if (totalLength < 18) {
        return {
          ok: false,
          reason: '1획을 아래쪽까지 시원하게 내려주세요.',
          feedbackType: 'length',
        };
      }

      return { ok: true, feedbackType: 'success' };
    }

    if (expectedStrokeIndex === 2) {
      // ぬ 2획: Starts top (57.12, 19.25), moves down, loops around, and forms pigtail knot at bottom right
      if (startDist > maxStartDist) {
        return {
          ok: false,
          reason: '2획 시작 위치(상단 ②)를 확인해 주세요.',
          feedbackType: 'start_pos',
        };
      }

      if (totalLength < 45) {
        return {
          ok: false,
          reason: '2획의 루프와 꼬리 매듭을 끝까지 완성해 주세요.',
          feedbackType: 'length',
        };
      }

      // Must traverse the lower area
      const maxY = Math.max(...points109.map((p) => p.y));
      if (maxY < 45) {
        return {
          ok: false,
          reason: '아래쪽으로 크게 원을 그리며 회전해 주세요.',
          feedbackType: 'direction',
        };
      }

      return { ok: true, feedbackType: 'success' };
    }
  }

  // Generic fallback validator for other characters when enabled
  if (startDist > maxStartDist) {
    return {
      ok: false,
      reason: `${strokeGuide.label} 시작 위치(${strokeGuide.label} 번호 근처)를 확인해 주세요.`,
      feedbackType: 'start_pos',
    };
  }

  return { ok: true, feedbackType: 'success' };
}
