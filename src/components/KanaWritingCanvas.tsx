import React, { useRef, useState, useEffect, useCallback } from 'react';
import { KanaCharacter } from '../types/kana';
import { validateStroke } from '../utils/strokeValidator';
import { sounds } from '../utils/audio';

interface KanaWritingCanvasProps {
  kana: KanaCharacter;
  isLocked?: boolean;
  lockOverlayTitle?: string;
  lockOverlayDesc?: string;
  onSimulateUnlock?: () => void;
  showTraceGuide?: boolean; // false in blind test mode
  colorScheme?: 'primary' | 'secondary';
  resetKey?: number; // increments when user clicks clear / rewrite
  onHasDrawnChange?: (hasDrawn: boolean) => void;
  activeStrokeIndex?: number; // optional external stroke control
  onStrokeChange?: (strokeIndex: number) => void;
}

export const KanaWritingCanvas: React.FC<KanaWritingCanvasProps> = ({
  kana,
  isLocked = false,
  lockOverlayTitle,
  lockOverlayDesc,
  onSimulateUnlock,
  showTraceGuide = true,
  colorScheme = 'primary',
  resetKey = 0,
  onHasDrawnChange,
  activeStrokeIndex: propActiveStroke,
  onStrokeChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isPointerDownRef = useRef<boolean>(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const currentPointsRef = useRef<Array<{ x: number; y: number }>>([]);
  const errorTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Completed strokes (each is an array of points in 800x800 space)
  const [completedStrokes, setCompletedStrokes] = useState<Array<Array<{ x: number; y: number }>>>([]);

  // Current expected stroke (1-based: 1, 2, 3...)
  const [currentExpectedStroke, setCurrentExpectedStroke] = useState<number>(1);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Error feedback state
  const [errorFeedback, setErrorFeedback] = useState<{
    points: Array<{ x: number; y: number }>;
    message: string;
  } | null>(null);

  // Success step message (e.g. "✓ 1획 성공! 2획을 이어서 써보세요.")
  const [stepSuccessMsg, setStepSuccessMsg] = useState<string | null>(null);

  // Only enable real-time stroke order/direction validation for 'ぬ' in this step
  const isValidationEnabled = kana.character === 'ぬ';

  // Active stroke to highlight on Layer 3
  const activeStrokeIndex =
    propActiveStroke !== undefined ? propActiveStroke : currentExpectedStroke;

  // Keep callback reference updated without triggering re-effects
  const onHasDrawnChangeRef = useRef(onHasDrawnChange);
  useEffect(() => {
    onHasDrawnChangeRef.current = onHasDrawnChange;
  }, [onHasDrawnChange]);

  // Redraw entire canvas (completed strokes in blue, error in red)
  const redrawCanvas = useCallback(
    (
      savedStrokes: Array<Array<{ x: number; y: number }>>,
      errStroke: { points: Array<{ x: number; y: number }> } | null
    ) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, 800, 800);

      // Draw all accepted completed strokes in blue
      ctx.lineWidth = 26;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#2563eb';
      ctx.fillStyle = '#2563eb';

      for (const stroke of savedStrokes) {
        if (stroke.length < 2) continue;
        ctx.beginPath();
        ctx.arc(stroke[0].x, stroke[0].y, 13, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(stroke[0].x, stroke[0].y);
        for (let i = 1; i < stroke.length; i++) {
          ctx.lineTo(stroke[i].x, stroke[i].y);
        }
        ctx.stroke();
      }

      // Draw error stroke in red if present
      if (errStroke && errStroke.points.length > 0) {
        ctx.strokeStyle = '#ef4444';
        ctx.fillStyle = '#ef4444';

        ctx.beginPath();
        ctx.arc(errStroke.points[0].x, errStroke.points[0].y, 13, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(errStroke.points[0].x, errStroke.points[0].y);
        for (let i = 1; i < errStroke.points.length; i++) {
          ctx.lineTo(errStroke.points[i].x, errStroke.points[i].y);
        }
        ctx.stroke();
      }
    },
    []
  );

  // Clear all drawing and state (triggered by resetKey or character change)
  const handleFullReset = useCallback(() => {
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }
    setCompletedStrokes([]);
    setCurrentExpectedStroke(1);
    setIsCompleted(false);
    setErrorFeedback(null);
    setStepSuccessMsg(null);
    currentPointsRef.current = [];

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 800, 800);
      }
    }

    if (onHasDrawnChangeRef.current) {
      onHasDrawnChangeRef.current(false);
    }
  }, []);

  // Clear when kana or resetKey changes
  useEffect(() => {
    handleFullReset();
  }, [kana.character, resetKey, handleFullReset]);

  // Convert client pointer coordinates to internal 800x800 canvas space
  const getCanvasPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 800;
    const y = ((e.clientY - rect.top) / rect.height) * 800;
    return { x, y };
  };

  // Pointer event handlers (smooth mouse and touch support)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isLocked || isCompleted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    // If an error is currently being displayed, clear it immediately upon new attempt
    if (errorFeedback) {
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
        errorTimerRef.current = null;
      }
      setErrorFeedback(null);
      redrawCanvas(completedStrokes, null);
    }

    setStepSuccessMsg(null);
    isPointerDownRef.current = true;
    const pos = getCanvasPos(e);
    lastPointRef.current = pos;
    currentPointsRef.current = [pos];

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineWidth = 26;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#2563eb';
      ctx.fillStyle = '#2563eb';

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 13, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDownRef.current || isLocked || isCompleted) return;
    const canvas = canvasRef.current;
    if (!canvas || !lastPointRef.current) return;

    const pos = getCanvasPos(e);
    currentPointsRef.current.push(pos);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineWidth = 26;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#2563eb';

      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }

    lastPointRef.current = pos;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    lastPointRef.current = null;

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore
    }

    const drawnPoints = [...currentPointsRef.current];
    currentPointsRef.current = [];

    if (drawnPoints.length < 2) return;

    // Real-time Stroke Validation logic
    if (isValidationEnabled && kana.strokes && kana.strokes.length > 0) {
      const expectedStrokeGuide =
        kana.strokes.find((s) => s.index === currentExpectedStroke) ||
        kana.strokes[currentExpectedStroke - 1];

      if (expectedStrokeGuide) {
        const validation = validateStroke(
          kana.character,
          currentExpectedStroke,
          drawnPoints,
          expectedStrokeGuide
        );

        if (validation.ok) {
          // --- [정답 처리] ---
          const nextSaved = [...completedStrokes, drawnPoints];
          setCompletedStrokes(nextSaved);
          redrawCanvas(nextSaved, null);
          sounds.playSuccessChime();

          if (currentExpectedStroke < kana.strokeCount) {
            // Advance to next stroke
            const nextIndex = currentExpectedStroke + 1;
            setCurrentExpectedStroke(nextIndex);
            if (onStrokeChange) {
              onStrokeChange(nextIndex);
            }
            setStepSuccessMsg(`✓ ${expectedStrokeGuide.label} 성공! ${nextIndex}획을 이어서 써보세요.`);
          } else {
            // All strokes completed!
            setIsCompleted(true);
            setStepSuccessMsg(`🎉 ${kana.character} 쓰기 완료! 완벽합니다.`);
            sounds.playMasterFanfare();
            if (onHasDrawnChangeRef.current) {
              onHasDrawnChangeRef.current(true);
            }
          }
          return;
        } else {
          // --- [오답 처리] ---
          sounds.playErrorBuzz();
          const errObj = {
            points: drawnPoints,
            message: validation.reason || '획의 순서와 방향을 다시 확인해 주세요.',
          };
          setErrorFeedback(errObj);
          // Redraw with the incorrect stroke in RED
          redrawCanvas(completedStrokes, errObj);

          // After 750ms, remove ONLY the failed stroke and keep previously completed strokes
          if (errorTimerRef.current) {
            clearTimeout(errorTimerRef.current);
          }
          errorTimerRef.current = setTimeout(() => {
            setErrorFeedback(null);
            redrawCanvas(completedStrokes, null);
            errorTimerRef.current = null;
          }, 850);
          return;
        }
      }
    }

    // Default free drawing path (for other characters until enabled)
    const nextSaved = [...completedStrokes, drawnPoints];
    setCompletedStrokes(nextSaved);
    redrawCanvas(nextSaved, null);
    if (onHasDrawnChangeRef.current) {
      onHasDrawnChangeRef.current(true);
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLCanvasElement>) => {
    handlePointerUp(e);
  };

  // Has verified stroke data check
  const hasVerifiedStrokes = Boolean(kana.strokes && kana.strokes.length > 0);
  const activeStrokeObj = hasVerifiedStrokes
    ? kana.strokes.find((s) => s.index === activeStrokeIndex) || kana.strokes[0]
    : null;

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {/* 4-Layer Drawing Container */}
      <div className="relative w-full aspect-square bg-[#fbf8ff] rounded-2xl overflow-hidden shadow-inner flex items-center justify-center select-none border border-transparent">
        {/* 1층: 십자 기준선 */}
        <div className="absolute inset-0 pointer-events-none select-none z-0">
          <svg
            className="w-full h-full stroke-slate-300/80"
            strokeDasharray="6,6"
            strokeWidth="1.5"
          >
            <line x1="50%" x2="50%" y1="0" y2="100%" />
            <line x1="0" x2="100%" y1="50%" y2="50%" />
          </svg>
        </div>

        {/* 2층: 연한 일본어 문자 밑그림 (표준 Unicode 일본어 폰트) */}
        {showTraceGuide && (
          <div
            className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none transition-opacity duration-200 z-5 ${
              isLocked ? 'opacity-25' : 'opacity-70'
            }`}
            style={{
              fontFamily: '"Noto Sans JP", "Yu Gothic", "Hiragino Sans", sans-serif',
            }}
          >
            <span
              className="text-[255px] font-bold text-[#b5b8d8] leading-none select-none tracking-normal"
              style={{
                textRendering: 'geometricPrecision',
                transform: 'translateY(-6px)',
              }}
            >
              {kana.character}
            </span>
          </div>
        )}

        {/* 3층: 검증된 획순 가이드 (Verified KanjiVG Stroke Layer) */}
        {showTraceGuide && hasVerifiedStrokes && (
          <svg
            viewBox="0 0 109 109"
            className="absolute inset-0 w-full h-full pointer-events-none select-none z-10"
          >
            {kana.strokes.map((s) => {
              const isActive = s.index === activeStrokeIndex;
              const isStrokeDone = isValidationEnabled && s.index < currentExpectedStroke;
              const strokeColor = colorScheme === 'primary' ? '#b32349' : '#00658e';
              const activeGlow = colorScheme === 'primary' ? '#ff5e7e' : '#38bdf8';

              return (
                <g key={`stroke-guide-${s.index}`}>
                  {/* Stroke path: active is highlighted, completed is subtle, future is dashed */}
                  <path
                    d={s.path}
                    fill="none"
                    stroke={isActive ? strokeColor : isStrokeDone ? '#2563eb' : '#94a3b8'}
                    strokeWidth={isActive ? '4' : '2'}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={isActive ? 0.95 : isStrokeDone ? 0.4 : 0.28}
                    strokeDasharray={isActive ? 'none' : '3,3'}
                  />

                  {/* Stroke number badge: highlighted on active stroke */}
                  {s.numberPos && (
                    <g
                      transform={`translate(${s.numberPos.x}, ${s.numberPos.y})`}
                      opacity={isActive ? 1 : 0.45}
                    >
                      <circle
                        cx="0"
                        cy="0"
                        r={isActive ? '5' : '4.2'}
                        fill={isActive ? strokeColor : isStrokeDone ? '#2563eb' : '#ffffff'}
                        stroke={isActive ? '#ffffff' : isStrokeDone ? '#ffffff' : '#94a3b8'}
                        strokeWidth={isActive ? '1.2' : '0.8'}
                      />
                      <text
                        x="0"
                        y="2.6"
                        textAnchor="middle"
                        fontSize="6"
                        fontWeight="bold"
                        fill={isActive || isStrokeDone ? '#ffffff' : '#475569'}
                        fontFamily="system-ui, sans-serif"
                      >
                        {isStrokeDone ? '✓' : s.index}
                      </text>
                    </g>
                  )}

                  {/* Pulsing startPoint marker on the active stroke */}
                  {isActive && !isCompleted && s.startPoint && (
                    <g transform={`translate(${s.startPoint.x}, ${s.startPoint.y})`}>
                      <circle
                        cx="0"
                        cy="0"
                        r="3.2"
                        fill={activeGlow}
                        opacity="0.8"
                        className="animate-ping"
                      />
                      <circle
                        cx="0"
                        cy="0"
                        r="2.2"
                        fill={strokeColor}
                        stroke="#ffffff"
                        strokeWidth="0.8"
                      />
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        )}

        {/* 4층: 사용자가 직접 쓰는 Canvas (투명 입력 레이어 - 현재 정상 작동 상태 완벽 유지) */}
        <canvas
          ref={canvasRef}
          width={800}
          height={800}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          className={`absolute inset-0 w-full h-full z-20 touch-none ${
            !isLocked && !isCompleted ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'
          }`}
          style={{
            touchAction: 'none',
          }}
        />

        {/* 오답 피드백 Toast 배너 (Error Banner with X icon) */}
        {errorFeedback && (
          <div className="absolute top-4 left-3 right-3 z-30 pointer-events-none flex justify-center animate-shake">
            <div className="bg-[#b32349] text-white px-4 py-2 rounded-full shadow-lg text-xs font-extrabold flex items-center gap-1.5 border border-white/30">
              <span className="material-symbols-outlined text-[17px]">cancel</span>
              <span>{errorFeedback.message}</span>
            </div>
          </div>
        )}

        {/* 단계 성공 / 전체 완료 알림 배너 (Step Success / Mastery Banner) */}
        {stepSuccessMsg && !errorFeedback && (
          <div className="absolute top-4 left-3 right-3 z-30 pointer-events-none flex justify-center animate-fade-in">
            <div
              className={`px-4 py-2 rounded-full shadow-md text-xs font-extrabold flex items-center gap-1.5 text-white ${
                isCompleted ? 'bg-emerald-600' : 'bg-[#00658e]'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">
                {isCompleted ? 'check_circle' : 'task_alt'}
              </span>
              <span>{stepSuccessMsg}</span>
            </div>
          </div>
        )}

        {/* Direct Drawing Guidance Hint (하단 부드러운 텍스트 안내) */}
        {showTraceGuide && !isLocked && !errorFeedback && !stepSuccessMsg && (
          <div className="absolute bottom-3 left-3 right-3 z-30 pointer-events-none flex justify-center">
            <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[#181a2e] text-xs font-bold shadow-xs border border-slate-200 flex items-center gap-1.5">
              <span
                className={`material-symbols-outlined text-[15px] ${
                  colorScheme === 'primary' ? 'text-[#b32349]' : 'text-[#00658e]'
                }`}
              >
                draw
              </span>
              <span>
                {isValidationEnabled && activeStrokeObj
                  ? `[${activeStrokeObj.label}] ${activeStrokeObj.direction}`
                  : activeStrokeObj
                  ? `${activeStrokeObj.label} 가이드를 따라 파란색으로 써보세요`
                  : `연한 ${kana.character} 밑그림 위를 파란색 선으로 직접 써보세요`}
              </span>
            </div>
          </div>
        )}

        {/* Blind-test mode prompt */}
        {!showTraceGuide && !isLocked && (
          <div className="absolute bottom-3 left-3 right-3 z-30 pointer-events-none flex justify-center">
            <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[#181a2e] text-xs font-bold shadow-xs border border-slate-200 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-[#2563eb]">draw</span>
              <span>기억을 되살려 {kana.character}를 직접 써보세요</span>
            </div>
          </div>
        )}

        {/* Locked Overlay UI (오른쪽 문자 대기 상태) */}
        {isLocked && (
          <div className="absolute inset-0 z-40 backdrop-blur-[6px] bg-[#fbf8ff]/75 flex flex-col items-center justify-center p-6 text-center select-none">
            <div className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center text-[#b32349] mb-3">
              <span className="material-symbols-outlined text-[30px]">lock</span>
            </div>
            <p className="text-lg font-bold text-[#181a2e] mb-1">
              {lockOverlayTitle || `${kana.character} 연습실 대기 중`}
            </p>
            <p className="text-xs text-[#594143] max-w-[260px] leading-relaxed">
              {lockOverlayDesc ||
                `왼쪽 문자를 먼저 써본 후 잠금이 해제되고 직접 쓸 수 있습니다.`}
            </p>
            {onSimulateUnlock && (
              <button
                type="button"
                onClick={onSimulateUnlock}
                className="mt-4 px-4 py-1.5 rounded-full bg-[#e6e6ff] hover:bg-[#d7d8f4] text-[#181a2e] text-xs font-bold transition-colors shadow-xs active:scale-95"
              >
                [테스트] 강제 잠금 해제
              </button>
            )}
          </div>
        )}
      </div>

      {/* 획순 가이드 단계별 전환 바 (Stroke Step Bar) */}
      {showTraceGuide && hasVerifiedStrokes && !isLocked && (
        <div className="flex items-center gap-1.5 bg-[#f4f2ff] p-1.5 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center gap-1">
            {kana.strokes.map((s) => {
              const isSelected = s.index === activeStrokeIndex;
              const isStrokeDone = isValidationEnabled && s.index < currentExpectedStroke;
              const activeColor =
                colorScheme === 'primary' ? 'bg-[#b32349] text-white' : 'bg-[#00658e] text-white';

              return (
                <button
                  key={`btn-stroke-${s.index}`}
                  type="button"
                  onClick={() => {
                    if (onStrokeChange) onStrokeChange(s.index);
                  }}
                  className={`px-3 py-1 rounded-lg font-bold transition-all text-xs flex items-center gap-1 ${
                    isSelected
                      ? `${activeColor} shadow-xs`
                      : isStrokeDone
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-white text-[#594143] hover:text-[#181a2e] border border-slate-200'
                  }`}
                >
                  {isStrokeDone && <span className="text-[11px] font-bold">✓</span>}
                  <span>{s.label}</span>
                  {isSelected && <span className="text-[10px]">●</span>}
                </button>
              );
            })}
          </div>

          {activeStrokeObj && (
            <div className="flex-1 truncate text-right text-[11px] font-medium text-[#594143] pr-1">
              <span className="font-bold text-[#181a2e]">{activeStrokeObj.label}:</span>{' '}
              <span className="text-[#b32349]">{activeStrokeObj.direction}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
