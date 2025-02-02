// types.ts
export interface Point {
  x: number;
  y: number;
  radius: number;
  createdAt: number;
  id: string;
  type: "bomb" | "target";
}

export interface GameConfig {
  duration: number; // Game duration in milliseconds
  maxPoints: number; // Maximum number of points on screen
  pointRadius: number; // Radius of point in pixels
  pointLifetime: number; // How long point exists before disappearing (ms)
  baseScore: number; // Base score for clicking a point
  timeBonusMultiplier: number; // Multiplier for quick reactions
  pointColor: string; // Color of points
  bombProbability: number; // Bomb probability (0.1 - 1)
  bombPenalty: number; // Penalty for clicking a bomb
  fadeInDuration: number; // Animation for point appearance
  scoreAnimationDuration: number; // Duration for score animation
  scoreAnimationDistance: number; // Distance for score animation
  oneStarsCPS: number;
  twoStarsCPS: number;
  threeStarsCPS: number;
}

// config.ts
export const DEFAULT_GAME_CONFIG: GameConfig = {
  duration: 30000, // 1 minute
  maxPoints: 2, // Maximum 2 points at once
  pointRadius: 24, // 20px radius for points
  pointLifetime: 2000, // Points disappear after 2 seconds
  baseScore: 1, // Base score for hitting a point
  timeBonusMultiplier: 2, // Up to 50% bonus for quick hits
  pointColor: "#ff0000", // Red points
  bombPenalty: 50, // Penalty for clicking a bomb
  bombProbability: 0.1,
  fadeInDuration: 150,
  scoreAnimationDuration: 500,
  scoreAnimationDistance: 15,
  oneStarsCPS: 0,
  twoStarsCPS: 2,
  threeStarsCPS: 3,
};
