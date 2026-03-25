export type AnimationKeys =
  | "walk"
  | "idle"
  | "carry"
  | "carryIdle"
  | "attack"
  | "mining"
  | "axe"
  | "hammering"
  | "swimming"
  | "drill"
  | "dig"
  | "dead";

export const PLAYER_DAMAGE = 2;
// Recompensa por avanzar de nivel
export const REWARD_ENERGY = 15;

export const onAnimationComplete = (
  object: Phaser.GameObjects.Sprite,
  animKey: string,
  callback: () => void,
) => {
  object?.once(
    Phaser.Animations.Events.ANIMATION_COMPLETE,
    (anim: Phaser.Animations.Animation) => {
      if (anim.key === animKey) {
        callback();
      }
    },
  );
};
export interface CrystalConfig {
  type: string;
  level: number;
  count: number;
}

export interface EnemyConfig {
  type: "SKELETON" | "KNIGHT" | "FRANKENSTEIN" | "DEVIL"; // Añade aquí más tipos si tienes
  count: number;
}

export interface LevelDesign {
  enemies: EnemyConfig[];
  traps: number;
  crystals: CrystalConfig[];
  pickaxes: number;
}
export interface LevelConfig {
  playerStart: { x: number; y: number };
}

export const LEVEL_MAPS: Record<number, LevelConfig> = {
  1: {
    playerStart: { x: 160, y: 128 },
  },
  2: {
    playerStart: { x: 32, y: 64 },
  },
  3: {
    playerStart: { x: 240, y: 64 },
  },
  4: {
    playerStart: { x: 288, y: 48 },
  },
  5: {
    playerStart: { x: 64, y: 64 },
  },
  6: {
    playerStart: { x: 48, y: 48 },
  },
  7: {
    playerStart: { x: 192, y: 256 },
  },
  8: {
    playerStart: { x: 64, y: 64 },
  },
  9: {
    playerStart: { x: 64, y: 256 },
  },
  10: {
    playerStart: { x: 64, y: 272 },
  },
};
export const LEVEL_SETTINGS: Record<
  number,
  { fogColor: number; fogAlpha: number }
> = {
  1: { fogColor: 0x191a27, fogAlpha: 0.7 },
  2: { fogColor: 0x191a27, fogAlpha: 0.8 },
  3: { fogColor: 0x191a27, fogAlpha: 0.9 },
  4: { fogColor: 0x191a27, fogAlpha: 1.0 },
  5: { fogColor: 0x191a27, fogAlpha: 1.0 },
  6: { fogColor: 0x271714, fogAlpha: 1.0 },
  7: { fogColor: 0x271714, fogAlpha: 1.0 },
  8: { fogColor: 0x271714, fogAlpha: 1.0 },
  9: { fogColor: 0x271714, fogAlpha: 1.0 },
  10: { fogColor: 0x271714, fogAlpha: 1.0 },
};
export const LEVEL_DESIGNS: Record<number, LevelDesign> = {
  1: {
    enemies: [
      { type: "FRANKENSTEIN", count: 0 },
      { type: "KNIGHT", count: 0 },
      { type: "SKELETON", count: 10 },
      { type: "DEVIL", count: 0 },
    ],
    traps: 5,
    crystals: [
      { type: "rosa", level: 4, count: 5 },
      { type: "blanco", level: 1, count: 3 },
    ],
    pickaxes: 3,
  },
  2: {
    enemies: [
      { type: "FRANKENSTEIN", count: 0 },
      { type: "KNIGHT", count: 3 },
      { type: "SKELETON", count: 8 },
      { type: "DEVIL", count: 0 },
    ],
    traps: 10,
    crystals: [
      { type: "azul", level: 2, count: 6 },
      { type: "rosa", level: 4, count: 5 },
      { type: "mixto", level: 2, count: 1 },
    ],
    pickaxes: 2,
  },
  3: {
    enemies: [
      { type: "FRANKENSTEIN", count: 2 },
      { type: "KNIGHT", count: 3 },
      { type: "SKELETON", count: 10 },
      { type: "DEVIL", count: 0 },
    ],
    traps: 15,
    crystals: [{ type: "mixto", level: 3, count: 8 }],
    pickaxes: 6,
  },
  4: {
    enemies: [
      { type: "FRANKENSTEIN", count: 4 },
      { type: "KNIGHT", count: 4 },
      { type: "SKELETON", count: 6 },
      { type: "DEVIL", count: 2 },
    ],
    traps: 10,
    crystals: [{ type: "mixto", level: 3, count: 8 }],
    pickaxes: 6,
  },
  5: {
    enemies: [
      { type: "FRANKENSTEIN", count: 0 },
      { type: "KNIGHT", count: 0 },
      { type: "SKELETON", count: 10 },
      { type: "DEVIL", count: 0 },
    ],
    traps: 5,
    crystals: [
      { type: "rosa", level: 4, count: 5 },
      { type: "blanco", level: 1, count: 3 },
    ],
    pickaxes: 3,
  },
  6: {
    enemies: [
      { type: "FRANKENSTEIN", count: 0 },
      { type: "KNIGHT", count: 0 },
      { type: "SKELETON", count: 10 },
      { type: "DEVIL", count: 0 },
    ],
    traps: 5,
    crystals: [
      { type: "rosa", level: 4, count: 5 },
      { type: "blanco", level: 1, count: 3 },
    ],
    pickaxes: 3,
  },
  7: {
    enemies: [
      { type: "FRANKENSTEIN", count: 0 },
      { type: "KNIGHT", count: 0 },
      { type: "SKELETON", count: 10 },
      { type: "DEVIL", count: 0 },
    ],
    traps: 5,
    crystals: [
      { type: "rosa", level: 4, count: 5 },
      { type: "blanco", level: 1, count: 3 },
    ],
    pickaxes: 3,
  },
  8: {
    enemies: [
      { type: "FRANKENSTEIN", count: 0 },
      { type: "KNIGHT", count: 0 },
      { type: "SKELETON", count: 10 },
      { type: "DEVIL", count: 0 },
    ],
    traps: 5,
    crystals: [
      { type: "rosa", level: 4, count: 5 },
      { type: "blanco", level: 1, count: 3 },
    ],
    pickaxes: 3,
  },
  9: {
    enemies: [
      { type: "FRANKENSTEIN", count: 0 },
      { type: "KNIGHT", count: 0 },
      { type: "SKELETON", count: 10 },
      { type: "DEVIL", count: 0 },
    ],
    traps: 5,
    crystals: [
      { type: "rosa", level: 4, count: 5 },
      { type: "blanco", level: 1, count: 3 },
    ],
    pickaxes: 3,
  },
  10: {
    enemies: [
      { type: "FRANKENSTEIN", count: 0 },
      { type: "KNIGHT", count: 0 },
      { type: "SKELETON", count: 10 },
      { type: "DEVIL", count: 0 },
    ],
    traps: 5,
    crystals: [
      { type: "rosa", level: 4, count: 5 },
      { type: "blanco", level: 1, count: 3 },
    ],
    pickaxes: 3,
  },
};

// También puedes mover otras constantes que tengas por ahí
export const TILE_SIZE = 16;
export interface PlayerStats {
  attack: number;
  defense: number;
  energy: number;
  maxEnergy: number;
  criticalChance: number;
  inventory: {
    pickaxe: number;
    [key: string]: number; // Permite otros items como los cristales
  };
}
export interface DropItem {
  sprite: string;
  label: string;
  action: (stats: PlayerStats) => void;
}

export const DROP_ITEMS_CONFIG: Record<string, DropItem> = {
  ATTACK: {
    sprite: "potion_attack",
    label: "+1 Ataque",
    action: (stats) => {
      stats.attack += 1;
    },
  },
  DEFENSE: {
    sprite: "shield_up",
    label: "+1 Defensa",
    action: (stats) => {
      stats.defense += 1;
    },
  },
  ENERGY_10: {
    sprite: "energy_big",
    label: "+10 Energía",
    action: (stats) => {
      stats.energy = Math.min(stats.energy + 10, stats.maxEnergy);
    },
  },
  ENERGY_5: {
    sprite: "energy_small",
    label: "+5 Energía",
    action: (stats) => {
      stats.energy = Math.min(stats.energy + 5, stats.maxEnergy);
    },
  },
  CRIT: {
    sprite: "crit_star",
    label: "+5% Crítico",
    action: (stats) => {
      stats.criticalChance += 0.05;
    },
  },
  PICKAXE: {
    sprite: "pickaxe",
    label: "+1 Pico",
    action: (stats) => {
      stats.inventory.pickaxe += 1;
    },
  },
};

export type DropKey = keyof typeof DROP_ITEMS_CONFIG;

export const DUNGEON_POINTS = {
  CRYSTALS: {
    mena_rosa_1: 100,
    mena_rosa_2: 200,
    mena_rosa_3: 300,
    mena_rosa_4: 400, // Coincide con tu nivel 4 de rosa
    mena_rosa_5: 500,
    mena_blanco_1: 150,
    mena_blanco_2: 300,
    mena_blanco_3: 450,
    mena_blanco_4: 600,
    mena_blanco_5: 750,
    mena_azul_1: 200,
    mena_azul_2: 400,
    mena_azul_3: 600,
    mena_azul_4: 800,
    mena_azul_5: 1000,
    mena_mixto_1: 250,
    mena_mixto_2: 500,
    mena_mixto_3: 750,
    mena_mixto_4: 1000,
    mena_mixto_5: 1250,
  },
  ENEMIES: {
    SKELETON: 200,
    KNIGHT: 400,
    FRANKENSTEIN: 600,
    DEVIL: 1000,
  },
  LEVEL_REWARD: (level: number) => level * 50,
};

export interface Card {
  type: "Común" | "Rara" | "Épica" | "Legendaria";
  name: string;
  color: string;
  bonus: unknown;
  icon: "attack" | "lightning" | "pickaxe" | "crit" | "defense";
}

// DEFINICIÓN DEL POOL DE CARTAS INDIVIDUALES
const CARD_POOL: Card[] = [
  // --- COMUNES (Blancas) ---
  {
    name: "Crit +0.05",
    type: "Común",
    color: "#ffffff",
    bonus: { crit: 0.05 },
    icon: "crit",
  },
  {
    name: "Defense +1",
    type: "Común",
    color: "#ffffff",
    bonus: { defense: 1 },
    icon: "defense",
  },
  {
    name: "Attack +1",
    type: "Común",
    color: "#ffffff",
    bonus: { attack: 1 },
    icon: "attack",
  },
  {
    name: "+5 energy",
    type: "Común",
    color: "#ffffff",
    bonus: { energy: 5 },
    icon: "lightning",
  },
  {
    name: "+10 energy",
    type: "Común",
    color: "#ffffff",
    bonus: { energy: 10 },
    icon: "lightning",
  },
  {
    name: "+1 pickaxe",
    type: "Común",
    color: "#ffffff",
    bonus: { pickaxe: 1 },
    icon: "pickaxe",
  },
  {
    name: "+5 max energy",
    type: "Rara",
    color: "#4592e5",
    bonus: { maxEnergy: 5 },
    icon: "lightning",
  },
  {
    name: "+10 max energy",
    type: "Rara",
    color: "#4592e5",
    bonus: { maxEnergy: 10 },
    icon: "lightning",
  },

  // --- RARAS (Azules) ---
  {
    name: "+2 Attack",
    type: "Rara",
    color: "#4592e5",
    bonus: { attack: 2 },
    icon: "attack",
  },
  {
    name: "+15 max energy",
    type: "Rara",
    color: "#4592e5",
    bonus: { maxEnergy: 15 },
    icon: "lightning",
  },
  {
    name: "+20 max energy",
    type: "Rara",
    color: "#4592e5",
    bonus: { maxEnergy: 20 },
    icon: "lightning",
  },
  {
    name: "+0.1 Crit",
    type: "Rara",
    color: "#4592e5",
    bonus: { crit: 0.1 },
    icon: "crit",
  },
  {
    name: "Defense +2",
    type: "Rara",
    color: "#4592e5",
    bonus: { defense: 2 },
    icon: "defense",
  },
  {
    name: "+2 pickaxe",
    type: "Rara",
    color: "#4592e5",
    bonus: { pickaxe: 2 },
    icon: "pickaxe",
  },

  // --- ÉPICAS (Moradas) ---
  {
    name: "+3 Attack",
    type: "Épica",
    color: "#b145e5",
    bonus: { attack: 3 },
    icon: "attack",
  },
  {
    name: "+3 pickaxe",
    type: "Épica",
    color: "#b145e5",
    bonus: { pickaxe: 3 },
    icon: "pickaxe",
  },
  {
    name: "+25 max energy",
    type: "Épica",
    color: "#b145e5",
    bonus: { maxEnergy: 25 },
    icon: "lightning",
  },
  {
    name: "+3 defense",
    type: "Épica",
    color: "#b145e5",
    bonus: { defense: 3 },
    icon: "defense",
  },
  {
    name: "+0.15 Crit",
    type: "Épica",
    color: "#b145e5",
    bonus: { crit: 0.15 },
    icon: "crit",
  },

  // --- LEGENDARIAS (Naranjas/Doradas) ---
  {
    name: "+5 Attack",
    type: "Legendaria",
    color: "#ff8c00",
    bonus: { attack: 5 },
    icon: "attack",
  },
  {
    name: "+5 defense",
    type: "Legendaria",
    color: "#ff8c00",
    bonus: { defense: 5 },
    icon: "defense",
  },
  {
    name: "+0.25 Crit",
    type: "Legendaria",
    color: "#ff8c00",
    bonus: { crit: 0.25 },
    icon: "crit",
  },
  {
    name: "+50 max energy",
    type: "Legendaria",
    color: "#ff8c00",
    bonus: { maxEnergy: 50 },
    icon: "lightning",
  },
  {
    name: "+10 pickaxe",
    type: "Legendaria",
    color: "#ff8c00",
    bonus: { pickaxe: 10 },
    icon: "pickaxe",
  },
];

export const getRandomCard = (): Card => {
  const rand = Math.random() * 100;
  let rarity: Card["type"];

  // Lógica de probabilidad (Roguelike)
  if (rand < 5)
    rarity = "Legendaria"; // 5%
  else if (rand < 20)
    rarity = "Épica"; // 15%
  else if (rand < 50)
    rarity = "Rara"; // 30%
  else rarity = "Común"; // 50%

  // Filtramos el pool por la rareza obtenida
  const possibleCards = CARD_POOL.filter((c) => c.type === rarity);

  // Retornamos una carta aleatoria de esa rareza
  return possibleCards[Math.floor(Math.random() * possibleCards.length)];
};
