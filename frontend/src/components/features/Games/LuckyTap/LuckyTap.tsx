import React, { useRef, useEffect, useState, useLayoutEffect } from "react";
import { DEFAULT_GAME_CONFIG, Point } from "./config";
import { BOMB_SVG, TARGET_SVG, WARNING_SVG } from "./utils";
import { PixelWrapper } from "@/components/shared/UI/PixelWrapper/pixelWrapper";
import { XPIcon } from "@/components/shared/UI/Icons/XPIcon";
import { Button } from "@/components/shared/UI/button";
import { ROUTES } from "@/routes/routes";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { useAppDispatch } from "@/redux/store";
import { MODALS, toggleModal } from "@/redux/features/modals.reducer";
import FinishLuckyTap from "@/components/shared/Modals/FinishLuckyTap";
import { setStats, STARS, STATS } from "@/redux/features/stats.reducer";
import { useIncreaseXPMutation } from "@/redux/services/raffle.api";
import { toast } from "sonner";
// import RulesLuckyTapModal from "@/components/shared/Modals/RulesLuckyTap";

interface ScoreAnimation {
  x: number;
  y: number;
  value: number;
  createdAt: number;
  id: string;
}

interface GameStats {
  totalClicks: number;
  clicksPerSecond: number;
  finalScore: number;
}

const LuckyTap: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetImageRef = useRef<HTMLImageElement | null>(null);
  const warningImageRef = useRef<HTMLImageElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const pausedTimeRef = useRef<number | null>(null);
  // ANIMATION REF
  const luckyTapRef = useRef<HTMLDivElement>(null);

  const bombImageRef = useRef<HTMLImageElement | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_GAME_CONFIG.duration);
  const [gameStarted, setGameStarted] = useState(false);
  const [points, setPoints] = useState<Point[]>([]);
  const [scoreAnimations, setScoreAnimations] = useState<ScoreAnimation[]>([]);

  const [increaseBalance] = useIncreaseXPMutation();

  // Stats
  const statsRef = useRef<{
    clickCount: number;
    startTime: number | null;
    totalPausedTime: number;
    lastPauseStart: number | null;
  }>({
    clickCount: 0,
    startTime: null,
    totalPausedTime: 0,
    lastPauseStart: null,
  });

  // Game state refs to access in callbacks
  const gameStateRef = useRef({
    points,
    score,
    gameStarted,
    timeLeft,
    isPaused,
    pointRegenerationTimers: new Map<string, NodeJS.Timeout>(),
    scoreAnimations,
  });

  // Load SVG image
  useEffect(() => {
    const loadSVGImage = (svg: string): Promise<HTMLImageElement> => {
      return new Promise((resolve) => {
        const img = new Image();
        const blob = new Blob([svg], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);

        img.onload = () => {
          URL.revokeObjectURL(url);
          resolve(img);
        };

        img.src = url;
      });
    };

    Promise.all([
      loadSVGImage(TARGET_SVG),
      loadSVGImage(WARNING_SVG),
      loadSVGImage(BOMB_SVG),
    ]).then(([targetImg, warningImg, bombImg]) => {
      targetImageRef.current = targetImg;
      warningImageRef.current = warningImg;
      bombImageRef.current = bombImg;
    });
  }, []);

  // Update ref when state changes
  useEffect(() => {
    gameStateRef.current = {
      ...gameStateRef.current,
      points,
      score,
      gameStarted,
      timeLeft,
      isPaused,
      scoreAnimations,
    };
  }, [points, score, gameStarted, timeLeft, isPaused, scoreAnimations]);

  const generatePoint = (): Point => {
    const canvas = canvasRef.current!;
    const radius = DEFAULT_GAME_CONFIG.pointRadius;

    const hasBomb = gameStateRef.current.points.some(
      (point) => point.type === "bomb"
    );

    const isBomb =
      !hasBomb && Math.random() < DEFAULT_GAME_CONFIG.bombProbability;

    return {
      x: Math.random() * (canvas.width - 2 * radius) + radius,
      y: Math.random() * (canvas.height - 2 * radius) + radius,
      radius,
      createdAt: Date.now(),
      id: Math.random().toString(36).substr(2, 9),
      type: isBomb ? "bomb" : "target",
    };
  };

  const schedulePointRegeneration = (pointId: string) => {
    if (gameStateRef.current.pointRegenerationTimers.has(pointId)) {
      clearTimeout(gameStateRef.current.pointRegenerationTimers.get(pointId));
    }

    const timer = setTimeout(() => {
      if (gameStateRef.current.gameStarted && !gameStateRef.current.isPaused) {
        setPoints((prev) => {
          // Find the point that needs regeneration
          const pointIndex = prev.findIndex((p) => p.id === pointId);
          if (pointIndex === -1) return prev;

          // Generate a new point
          const newPoint = generatePoint();

          // Create a new array with the regenerated point
          const newPoints = [...prev];
          newPoints[pointIndex] = newPoint;

          // Schedule regeneration for the new point
          schedulePointRegeneration(newPoint.id);

          return newPoints;
        });
      }
    }, DEFAULT_GAME_CONFIG.pointLifetime);

    gameStateRef.current.pointRegenerationTimers.set(pointId, timer);
  };

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setTimeLeft(DEFAULT_GAME_CONFIG.duration);
    setIsPaused(false);
    pausedTimeRef.current = null;

    // Reset statistics
    statsRef.current = {
      clickCount: 0,
      startTime: Date.now(),
      totalPausedTime: 0,
      lastPauseStart: null,
    };

    const initialPoints = Array.from(
      { length: DEFAULT_GAME_CONFIG.maxPoints },
      generatePoint
    );
    setPoints(initialPoints);

    initialPoints.forEach((point) => {
      schedulePointRegeneration(point.id);
    });
  };

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!gameStateRef.current.gameStarted || isPaused) return;

    statsRef.current.clickCount++;
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);

    const clickedPointIndex = gameStateRef.current.points.findIndex((point) => {
      const distanceSquared =
        (x - point.x) * (x - point.x) + (y - point.y) * (y - point.y);
      return distanceSquared <= point.radius * point.radius;
    });

    if (clickedPointIndex !== -1) {
      const clickedPoint = gameStateRef.current.points[clickedPointIndex];
      let pointScore = 0;

      if (clickedPoint.type === "bomb") {
        // Handle bomb click
        pointScore = -DEFAULT_GAME_CONFIG.bombPenalty;
        setScore((prev) => Math.max(0, prev - DEFAULT_GAME_CONFIG.bombPenalty));
      } else {
        // Handle target click (existing logic)
        const timeDiff = Date.now() - clickedPoint.createdAt;
        const timeBonus =
          Math.max(0, 1 - timeDiff / DEFAULT_GAME_CONFIG.pointLifetime) *
          DEFAULT_GAME_CONFIG.timeBonusMultiplier;

        pointScore = Math.floor(
          DEFAULT_GAME_CONFIG.baseScore * (1 + timeBonus)
        );
        setScore((prev) => prev + pointScore);
      }

      // Add score animation
      const newAnimation: ScoreAnimation = {
        x: clickedPoint.x,
        y: clickedPoint.y,
        value: pointScore,
        createdAt: Date.now(),
        id: Math.random().toString(36).substr(2, 9),
      };

      setScoreAnimations((prev) => [...prev, newAnimation]);

      // Remove animation after duration
      setTimeout(() => {
        setScoreAnimations((prev) =>
          prev.filter((animation) => animation.id !== newAnimation.id)
        );
      }, DEFAULT_GAME_CONFIG.scoreAnimationDuration);

      if (gameStateRef.current.pointRegenerationTimers.has(clickedPoint.id)) {
        clearTimeout(
          gameStateRef.current.pointRegenerationTimers.get(clickedPoint.id)
        );
        gameStateRef.current.pointRegenerationTimers.delete(clickedPoint.id);
      }

      setPoints((prev) => {
        const newPoint = generatePoint();
        const newPoints = prev.map((p, idx) =>
          idx === clickedPointIndex ? newPoint : p
        );
        schedulePointRegeneration(newPoint.id);
        return newPoints;
      });
    }
  };

  const handlePause = () => {
    setIsPaused((prev) => {
      if (!prev) {
        // Pausing the game
        pausedTimeRef.current = Date.now();
        // Clear all existing regeneration timers
        gameStateRef.current.pointRegenerationTimers.forEach((timer) => {
          clearTimeout(timer);
        });
        gameStateRef.current.pointRegenerationTimers.clear();
        statsRef.current.lastPauseStart = Date.now();
      } else {
        // Resuming the game
        if (statsRef.current.lastPauseStart) {
          statsRef.current.totalPausedTime +=
            Date.now() - statsRef.current.lastPauseStart;
          statsRef.current.lastPauseStart = null;
        }
        if (pausedTimeRef.current) {
          const pauseDuration = Date.now() - pausedTimeRef.current;
          // Update all points' creation times
          setPoints((prevPoints) =>
            prevPoints.map((point) => ({
              ...point,
              createdAt: point.createdAt + pauseDuration,
            }))
          );
          // Reschedule all point regenerations
          points.forEach((point) => {
            schedulePointRegeneration(point.id);
          });
        }
        pausedTimeRef.current = null;
      }
      return !prev;
    });
  };
  const calculateAndLogGameStats = (): GameStats => {
    const endTime = Date.now();
    const totalGameTime = endTime - (statsRef.current.startTime || endTime);
    const activeGameTime = totalGameTime - statsRef.current.totalPausedTime;
    const gameTimeInSeconds = activeGameTime / 1000;

    const stats: GameStats = {
      totalClicks: statsRef.current.clickCount,
      clicksPerSecond: Number(
        (statsRef.current.clickCount / gameTimeInSeconds).toFixed(2)
      ),
      finalScore: score,
    };

    const starsAmount =
      stats.clicksPerSecond >= DEFAULT_GAME_CONFIG.threeStarsCPS
        ? STARS.THREE
        : stats.clicksPerSecond >= DEFAULT_GAME_CONFIG.twoStarsCPS
        ? STARS.TWO
        : STARS.ONE;

    dispatch(toggleModal({ key: MODALS.FINISH_LUCKY_TAP, value: true }));
    dispatch(
      setStats({
        type: STATS.TAP,
        payload: {
          stars: starsAmount,
          finishScore: gameStateRef.current.score,
          clicksPerSecond: stats.clicksPerSecond,
          totalClicks: stats.totalClicks,
        },
      })
    );

    increaseBalance({
      telegramId: window.Telegram?.WebApp?.initDataUnsafe?.user?.id + "",
      xp: stats.finalScore,
    })
      .unwrap()
      .then((res) => {
        if (res) {
          console.log("✅ Balance updated successfully");
        } else {
          console.log(res);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to update balance! Please try again later.");
      });

    return stats;
  };

  // Game timer
  useEffect(() => {
    if (!gameStarted || isPaused) return;

    const gameTimer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(gameTimer);
          setGameStarted(false);
          setIsPaused(false);
          gameStateRef.current.pointRegenerationTimers.forEach((timer) => {
            clearTimeout(timer);
          });
          gameStateRef.current.pointRegenerationTimers.clear();

          // Calculate and log final game statistics
          calculateAndLogGameStats();
          return 0;
        }
        return prev - 100;
      });
    }, 100);

    return () => {
      clearInterval(gameTimer);
      gameStateRef.current.pointRegenerationTimers.forEach((timer) => {
        clearTimeout(timer);
      });
      gameStateRef.current.pointRegenerationTimers.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted, isPaused]);

  // Render loop with SVG targets
  useEffect(() => {
    const canvas = canvasRef.current;
    if (
      !canvas ||
      !targetImageRef.current ||
      !warningImageRef.current ||
      !bombImageRef.current
    )
      return;

    const ctx = canvas.getContext("2d", { alpha: true })!;
    ctx.imageSmoothingEnabled = true;

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (points.length > 0) {
        points.forEach((point) => {
          const x = point.x - point.radius;
          const y = point.y - point.radius;
          const size = point.radius * 2;

          // Calculate fade-in opacity for new points
          const fadeInAge = Date.now() - point.createdAt;
          const fadeInOpacity = Math.min(
            fadeInAge / DEFAULT_GAME_CONFIG.fadeInDuration,
            1
          );

          // Calculate age-based warning transition
          const age = Date.now() - point.createdAt;
          const ageRatio = age / DEFAULT_GAME_CONFIG.pointLifetime;

          if (point.type === "bomb") {
            ctx.globalAlpha = fadeInOpacity;
            ctx.drawImage(bombImageRef.current!, x, y, size, size);
          } else {
            if (ageRatio < 0.5) {
              ctx.globalAlpha = fadeInOpacity;
              ctx.drawImage(targetImageRef.current!, x, y, size, size);
            } else {
              const transitionRatio = (ageRatio - 0.5) * 2;
              // Target fading out
              ctx.globalAlpha = (1 - transitionRatio) * fadeInOpacity;
              ctx.drawImage(targetImageRef.current!, x, y, size, size);
              // Warning fading in
              ctx.globalAlpha = transitionRatio * fadeInOpacity;
              ctx.drawImage(warningImageRef.current!, x, y, size, size);
            }
          }
          ctx.globalAlpha = 1;
        });
      }

      // Render score animations
      scoreAnimations.forEach((animation) => {
        const age = Date.now() - animation.createdAt;
        const progress = age / DEFAULT_GAME_CONFIG.scoreAnimationDuration;

        if (progress <= 1) {
          const opacity = 1 - progress;
          const yOffset = DEFAULT_GAME_CONFIG.scoreAnimationDistance * progress;

          ctx.save();
          ctx.globalAlpha = opacity;
          ctx.font = "bold 16px PressStart2P-Regular";
          ctx.fillStyle = animation.value >= 0 ? "#ffffff" : "#ff0000";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(
            `${animation.value >= 0 ? "+" : ""}${animation.value}`,
            animation.x,
            animation.y - yOffset
          );
          ctx.restore();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [points, scoreAnimations]);

  // Animations

  useLayoutEffect(() => {
    if (luckyTapRef.current) {
      const luckyTap = luckyTapRef.current;
      const ctx = gsap.context(() => {
        gsap.fromTo(
          luckyTap.querySelector("#timerLuckyTap"),
          {
            y: -50,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power4.inOut",
          }
        );

        gsap.fromTo(
          luckyTap.querySelector("#xpLuckyTap"),
          {
            y: -50,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            delay: 0.1,
            ease: "power4.inOut",
          }
        );

        gsap.fromTo(
          luckyTap.querySelector("#lefttBtnLuckyTap"),
          {
            y: 35,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            delay: 0.2,
            ease: "power4.inOut",
          }
        );

        gsap.fromTo(
          luckyTap.querySelector("#rightBtnLuckyTap"),
          {
            y: 35,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            delay: 0.3,
            ease: "power4.inOut",
          }
        );

        gsap.fromTo(
          luckyTap.querySelector("#startLuckyTap"),
          {
            opacity: 0,
          },
          {
            opacity: 1,
            duration: 1,
            delay: 0.1,
            ease: "power4.inOut",
          }
        );
      });

      return () => {
        ctx.revert();
      };
    }
  }, []);

  return (
    <div
      id="lucky-tap"
      ref={luckyTapRef}
      className="relative w-full h-screen flex items-center justify-center"
    >
      <FinishLuckyTap />
      {/* <RulesLuckyTapModal /> */}
      {!gameStarted && (
        <div
          id="startLuckyTap"
          className="absolute z-10 w-full h-full flex items-center justify-center"
          onClick={startGame}
        >
          <img src="/click-start.svg" className="w-[240px] h-auto" />
        </div>
      )}

      {isPaused && (
        <div className="absolute z-10 w-full h-full flex items-center justify-center">
          <img src="/paused.svg" className="w-[240px] h-auto" />
        </div>
      )}

      <div className="absolute top-8 px-4 bottom-auto m-auto grid grid-cols-2 h-[80px] w-full items-center gap-3">
        <div
          id="timerLuckyTap"
          className="relative bg-inkwell w-full h-[80px] flex flex-col justify-center items-center gap-3"
        >
          <PixelWrapper width={2} color={"gray"} />
          <span className="text-center text-base leading-none text-rock uppercase">
            time LEFT:
          </span>
          <span className="flex justify-center items-center gap-2 text-xl">
            <img src="/clock.svg" className="w-5 h-5" />
            <span>
              {Math.ceil(timeLeft / 1000)}
              <span className="text-rock uppercase">S</span>
            </span>
          </span>
        </div>
        <div
          id="xpLuckyTap"
          className="relative bg-inkwell w-full h-[80px] flex flex-col justify-center items-center gap-3"
        >
          <PixelWrapper width={2} color={"gray"} />
          <span className="text-center text-base leading-none text-rock uppercase">
            XP EARNED:
          </span>
          <span className="flex justify-center items-center gap-2 text-xl">
            <span>{score}</span>
            <XPIcon className="!w-5 !h-5" />
          </span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        height={window.innerHeight * 0.6}
        width={window.innerWidth}
        className="w-full h-[60vh]"
        onClick={handleClick}
      />

      <div className="absolute bottom-8 px-4 z-[15] top-auto max-w-[316px] m-auto grid grid-cols-2 h-[80px] w-full items-center gap-3">
        {!gameStarted ? (
          <Button id="lefttBtnLuckyTap" onClick={startGame}>
            Start
          </Button>
        ) : (
          <Button onClick={handlePause}>{isPaused ? "Resume" : "Pause"}</Button>
        )}
        <Button
          id="rightBtnLuckyTap"
          variant={"ghost"}
          className="w-full"
          onClick={() => {
            if (gameStarted) {
              setGameStarted(false);
              setPoints([]);
              setTimeLeft(DEFAULT_GAME_CONFIG.duration);
              setScore(0);
              setIsPaused(false);
            } else {
              navigate(ROUTES.GAMES);
            }
          }}
        >
          {gameStarted ? "End Game" : "Back to main"}
        </Button>
      </div>
    </div>
  );
};

export default LuckyTap;
