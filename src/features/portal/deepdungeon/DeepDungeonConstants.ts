import { Equipped } from "features/game/types/bumpkin";
import { translate } from "lib/i18n/translate";

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
export const PORTAL_NAME = "deep-dungeon";
export const PORTAL_TOKEN = "Deep Token";
export const UNLIMITED_ATTEMPTS_COST = 3;
export const RESTOCK_ATTEMPTS_COST = 1;
export const HINT_COST = 0.25;
export const DAILY_ATTEMPTS = 5;
export const RESTOCK_ATTEMPTS = 3;

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

interface DropTable {
  energyDrops: { amount: number; weight: number }[];
}
export const CRYSTAL_DROP_TABLE: Record<string, DropTable> = {
  pink_crystal_1: {
    energyDrops: [
      { amount: 3, weight: 40 },
      { amount: 4, weight: 20 },
      { amount: 5, weight: 30 },
      { amount: 6, weight: 10 },
    ],
  },
  pink_crystal_2: {
    energyDrops: [
      { amount: 4, weight: 40 },
      { amount: 5, weight: 20 },
      { amount: 6, weight: 30 },
      { amount: 7, weight: 10 },
    ],
  },
  pink_crystal_3: {
    energyDrops: [
      { amount: 5, weight: 40 },
      { amount: 6, weight: 20 },
      { amount: 7, weight: 30 },
      { amount: 8, weight: 10 },
    ],
  },
  pink_crystal_4: {
    energyDrops: [
      { amount: 6, weight: 40 },
      { amount: 7, weight: 20 },
      { amount: 8, weight: 30 },
      { amount: 9, weight: 10 },
    ],
  },
  pink_crystal_5: {
    energyDrops: [
      { amount: 7, weight: 40 },
      { amount: 8, weight: 20 },
      { amount: 9, weight: 30 },
      { amount: 10, weight: 10 },
    ],
  },
  white_crystal_1: {
    energyDrops: [
      { amount: 4, weight: 40 },
      { amount: 5, weight: 20 },
      { amount: 6, weight: 30 },
      { amount: 7, weight: 10 },
    ],
  },
  white_crystal_2: {
    energyDrops: [
      { amount: 5, weight: 40 },
      { amount: 6, weight: 20 },
      { amount: 7, weight: 30 },
      { amount: 8, weight: 10 },
    ],
  },
  white_crystal_3: {
    energyDrops: [
      { amount: 6, weight: 40 },
      { amount: 7, weight: 20 },
      { amount: 8, weight: 30 },
      { amount: 9, weight: 10 },
    ],
  },
  white_crystal_4: {
    energyDrops: [
      { amount: 7, weight: 40 },
      { amount: 8, weight: 20 },
      { amount: 9, weight: 30 },
      { amount: 10, weight: 10 },
    ],
  },
  white_crystal_5: {
    energyDrops: [
      { amount: 8, weight: 40 },
      { amount: 9, weight: 20 },
      { amount: 10, weight: 30 },
      { amount: 11, weight: 10 },
    ],
  },
  blue_crystal_1: {
    energyDrops: [
      { amount: 5, weight: 40 },
      { amount: 6, weight: 20 },
      { amount: 7, weight: 30 },
      { amount: 8, weight: 10 },
    ],
  },
  blue_crystal_2: {
    energyDrops: [
      { amount: 6, weight: 40 },
      { amount: 7, weight: 20 },
      { amount: 8, weight: 30 },
      { amount: 9, weight: 10 },
    ],
  },
  blue_crystal_3: {
    energyDrops: [
      { amount: 7, weight: 40 },
      { amount: 8, weight: 20 },
      { amount: 9, weight: 30 },
      { amount: 10, weight: 10 },
    ],
  },
  blue_crystal_4: {
    energyDrops: [
      { amount: 8, weight: 40 },
      { amount: 9, weight: 20 },
      { amount: 10, weight: 30 },
      { amount: 11, weight: 10 },
    ],
  },
  blue_crystal_5: {
    energyDrops: [
      { amount: 9, weight: 40 },
      { amount: 10, weight: 20 },
      { amount: 11, weight: 30 },
      { amount: 12, weight: 10 },
    ],
  },
  prismora_crystal_1: {
    energyDrops: [
      { amount: 8, weight: 40 },
      { amount: 9, weight: 20 },
      { amount: 10, weight: 30 },
      { amount: 11, weight: 10 },
    ],
  },
  prismora_crystal_2: {
    energyDrops: [
      { amount: 9, weight: 40 },
      { amount: 10, weight: 20 },
      { amount: 11, weight: 30 },
      { amount: 12, weight: 10 },
    ],
  },
  prismora_crystal_3: {
    energyDrops: [
      { amount: 10, weight: 40 },
      { amount: 11, weight: 20 },
      { amount: 12, weight: 30 },
      { amount: 13, weight: 10 },
    ],
  },
  prismora_crystal_4: {
    energyDrops: [
      { amount: 11, weight: 40 },
      { amount: 12, weight: 20 },
      { amount: 13, weight: 30 },
      { amount: 14, weight: 10 },
    ],
  },
  prismora_crystal_5: {
    energyDrops: [
      { amount: 12, weight: 40 },
      { amount: 13, weight: 20 },
      { amount: 14, weight: 30 },
      { amount: 15, weight: 10 },
    ],
  },
};

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
      { type: "SKELETON", count: 7 },
      { type: "DEVIL", count: 0 },
    ],
    traps: 5,
    crystals: [
      { type: "pink", level: 1, count: 5 },
      { type: "pink", level: 3, count: 3 },
      { type: "pink", level: 5, count: 1 },
      { type: "white", level: 2, count: 4 },
    ],
    pickaxes: 3,
  },
  2: {
    enemies: [
      { type: "FRANKENSTEIN", count: 0 },
      { type: "KNIGHT", count: 0 },
      { type: "SKELETON", count: 10 },
      { type: "DEVIL", count: 0 },
    ],
    traps: 5,
    crystals: [
      { type: "pink", level: 2, count: 4 },
      { type: "pink", level: 4, count: 2 },
      { type: "white", level: 1, count: 5 },
      { type: "white", level: 3, count: 3 },
    ],
    pickaxes: 3,
  },
  3: {
    enemies: [
      { type: "FRANKENSTEIN", count: 0 },
      { type: "KNIGHT", count: 2 },
      { type: "SKELETON", count: 10 },
      { type: "DEVIL", count: 0 },
    ],
    traps: 5,
    crystals: [
      { type: "pink", level: 3, count: 3 },
      { type: "pink", level: 5, count: 1 },
      { type: "white", level: 2, count: 4 },
      { type: "white", level: 4, count: 2 },
    ],
    pickaxes: 3,
  },
  4: {
    enemies: [
      { type: "FRANKENSTEIN", count: 0 },
      { type: "KNIGHT", count: 4 },
      { type: "SKELETON", count: 10 },
      { type: "DEVIL", count: 0 },
    ],
    traps: 5,
    crystals: [
      { type: "white", level: 1, count: 5 },
      { type: "white", level: 3, count: 3 },
      { type: "white", level: 5, count: 1 },
      { type: "blue", level: 2, count: 4 },
    ],
    pickaxes: 6,
  },
  5: {
    enemies: [
      { type: "FRANKENSTEIN", count: 1 },
      { type: "KNIGHT", count: 2 },
      { type: "SKELETON", count: 10 },
      { type: "DEVIL", count: 0 },
    ],
    traps: 5,
    crystals: [
      { type: "white", level: 2, count: 4 },
      { type: "white", level: 4, count: 2 },
      { type: "blue", level: 1, count: 5 },
      { type: "blue", level: 3, count: 3 },
    ],
    pickaxes: 3,
  },
  6: {
    enemies: [
      { type: "FRANKENSTEIN", count: 2 },
      { type: "KNIGHT", count: 2 },
      { type: "SKELETON", count: 10 },
      { type: "DEVIL", count: 1 },
    ],
    traps: 6,
    crystals: [
      { type: "white", level: 3, count: 3 },
      { type: "white", level: 5, count: 1 },
      { type: "blue", level: 2, count: 4 },
      { type: "blue", level: 4, count: 2 },
    ],
    pickaxes: 3,
  },
  7: {
    enemies: [
      { type: "FRANKENSTEIN", count: 3 },
      { type: "KNIGHT", count: 5 },
      { type: "SKELETON", count: 10 },
      { type: "DEVIL", count: 1 },
    ],
    traps: 7,
    crystals: [
      { type: "white", level: 4, count: 2 },
      { type: "blue", level: 1, count: 5 },
      { type: "blue", level: 3, count: 3 },
      { type: "blue", level: 5, count: 1 },
    ],
    pickaxes: 3,
  },
  8: {
    enemies: [
      { type: "FRANKENSTEIN", count: 3 },
      { type: "KNIGHT", count: 2 },
      { type: "SKELETON", count: 10 },
      { type: "DEVIL", count: 2 },
    ],
    traps: 8,
    crystals: [
      { type: "blue", level: 2, count: 4 },
      { type: "blue", level: 4, count: 2 },
      { type: "prismora", level: 1, count: 5 },
      { type: "prismora", level: 3, count: 3 },
    ],
    pickaxes: 3,
  },
  9: {
    enemies: [
      { type: "FRANKENSTEIN", count: 5 },
      { type: "KNIGHT", count: 3 },
      { type: "SKELETON", count: 10 },
      { type: "DEVIL", count: 3 },
    ],
    traps: 9,
    crystals: [
      { type: "blue", level: 3, count: 3 },
      { type: "blue", level: 5, count: 1 },
      { type: "prismora", level: 2, count: 4 },
      { type: "prismora", level: 4, count: 2 },
    ],
    pickaxes: 3,
  },
  10: {
    enemies: [
      { type: "FRANKENSTEIN", count: 5 },
      { type: "KNIGHT", count: 5 },
      { type: "SKELETON", count: 10 },
      { type: "DEVIL", count: 5 },
    ],
    traps: 10,
    crystals: [
      { type: "blue", level: 4, count: 2 },
      { type: "prismora", level: 1, count: 5 },
      { type: "prismora", level: 3, count: 3 },
      { type: "prismora", level: 5, count: 1 },
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
    sprite: "sword",
    label: "+1 Attack",
    action: (stats) => {
      stats.attack += 1;
    },
  },
  DEFENSE: {
    sprite: "shield",
    label: "+1 Defense",
    action: (stats) => {
      stats.defense += 1;
    },
  },
  CRIT: {
    sprite: "crit",
    label: "+5% Critical Chance",
    action: (stats) => {
      stats.criticalChance += 0.05;
    },
  },
  PICKAXE: {
    sprite: "pickaxe",
    label: "+1 Pickaxe",
    action: (stats) => {
      stats.inventory.pickaxe += 1;
    },
  },
};

export type DropKey = keyof typeof DROP_ITEMS_CONFIG;

export const DUNGEON_POINTS = {
  CRYSTALS: {
    pink_crystal_1: 100,
    pink_crystal_2: 200,
    pink_crystal_3: 300,
    pink_crystal_4: 400,
    pink_crystal_5: 500,
    white_crystal_1: 150,
    white_crystal_2: 300,
    white_crystal_3: 450,
    white_crystal_4: 600,
    white_crystal_5: 750,
    blue_crystal_1: 200,
    blue_crystal_2: 400,
    blue_crystal_3: 600,
    blue_crystal_4: 800,
    blue_crystal_5: 1000,
    prismora_crystal_1: 250,
    prismora_crystal_2: 500,
    prismora_crystal_3: 750,
    prismora_crystal_4: 1000,
    prismora_crystal_5: 1250,
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
  if (rand < 3)
    rarity = "Legendaria"; // 3%
  else if (rand < 15)
    rarity = "Épica"; // 12%
  else if (rand < 40)
    rarity = "Rara"; // 25%
  else rarity = "Común"; // 60%

  // Filtramos el pool por la rareza obtenida
  const possibleCards = CARD_POOL.filter((c) => c.type === rarity);

  // Retornamos una carta aleatoria de esa rareza
  return possibleCards[Math.floor(Math.random() * possibleCards.length)];
};

export const DEEPDUNGEON_NPC_WEARABLES: Equipped = {
  hair: "Greyed Glory",
  body: "Infernal Bumpkin Potion",
  shirt: "Skull Shirt",
  pants: "Crimstone Pants",
  shoes: "Crimstone Boots",
  tool: "Skinning Knife",
  hat: "Skull Hat",
};

//Guide
export const INSTRUCTIONS: {
  image: string;
  description: string;
  width?: number;
}[] = [
  {
    image: "world/DeepDungeonAssets/lightning.png",
    description: translate("deepdungeon.instructions1"),
  },
  {
    image: "world/DeepDungeonAssets/pickaxe.png",
    description: translate("deepdungeon.instructions2"),
  },
  {
    image: "world/DeepDungeonAssets/heart.png",
    description: translate("deepdungeon.instructions3"),
  },
  {
    image: "world/DeepDungeonAssets/sword.png",
    description: translate("deepdungeon.instructions4"),
  },
  {
    image: "world/DeepDungeonAssets/shield.png",
    description: translate("deepdungeon.instructions5"),
  },
  {
    image: "world/DeepDungeonAssets/crit.png",
    description: translate("deepdungeon.instructions6"),
  },
];
