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
  x: number; // Coordenada X de inicio del jugador
  y: number; // Coordenada Y de inicio del jugador
}
export interface LevelConfig {
  playerStart: { x: number; y: number };
  npcs: NPCBumpkin[];
}

export const LEVEL_MAPS: Record<number, LevelConfig> = {
  1: {
    playerStart: { x: 160, y: 128 },
    npcs: [{ x: 380, y: 400, npc: "portaller" }],
  },
  2: {
    playerStart: { x: 32, y: 64 }, // Coordenadas distintas para el nivel 2
    npcs: [{ x: 200, y: 200, npc: "portaller" }],
  },
  3: {
    playerStart: { x: 80, y: 64 },
    npcs: [{ x: 380, y: 400, npc: "portaller" }],
  },
  4: {
    playerStart: { x: 64, y: 64 },
    npcs: [{ x: 380, y: 400, npc: "portaller" }],
  },
  // Añ
};
export const LEVEL_SETTINGS: Record<
  number,
  { fogColor: number; fogAlpha: number }
> = {
  1: { fogColor: 0x191a27, fogAlpha: 0.7 },
  2: { fogColor: 0x191a27, fogAlpha: 0.8 },
  3: { fogColor: 0x191a27, fogAlpha: 0.9 },
  4: { fogColor: 0x271714, fogAlpha: 1.0 },
};
export const LEVEL_DESIGNS: Record<number, LevelDesign> = {
  1: {
    enemies: [{ type: "FRANKENSTEIN", count: 5 }],
    traps: 5,
    crystals: [
      { type: "rosa", level: 4, count: 5 },
      { type: "blanco", level: 1, count: 3 },
    ],
    pickaxes: 3,
    x: 380,
    y: 400,
  },
  2: {
    enemies: [
      { type: "FRANKENSTEIN", count: 4 },
      { type: "KNIGHT", count: 2 },
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
    enemies: [{ type: "KNIGHT", count: 5 }],
    traps: 15,
    crystals: [{ type: "mixto", level: 3, count: 8 }],
    pickaxes: 6,
  },
  4: {
    enemies: [
      { type: "KNIGHT", count: 5 },
      { type: "FRANKENSTEIN", count: 4 },
    ],
    traps: 15,
    crystals: [{ type: "mixto", level: 3, count: 8 }],
    pickaxes: 6,
  },
  // Puedes seguir añadiendo niveles aquí...
};

// También puedes mover otras constantes que tengas por ahí
export const TILE_SIZE = 16;

export const DROP_ITEMS_CONFIG = {
  ATTACK: {
    sprite: "potion_attack",
    label: "+1 Ataque",
    action: (stats: any) => (stats.attack += 1),
  },
  DEFENSE: {
    sprite: "shield_up",
    label: "+1 Defensa",
    action: (stats: any) => (stats.defense += 1),
  },
  ENERGY_10: {
    sprite: "energy_big",
    label: "+10 Energía",
    action: (stats: any) =>
      (stats.energy = Math.min(stats.energy + 10, stats.maxEnergy)),
  },
  ENERGY_5: {
    sprite: "energy_small",
    label: "+5 Energía",
    action: (stats: any) =>
      (stats.energy = Math.min(stats.energy + 5, stats.maxEnergy)),
  },
  CRIT: {
    sprite: "crit_star",
    label: "+5% Crítico",
    action: (stats: any) => (stats.criticalChance += 0.05),
  },
  PICKAXE: {
    sprite: "pickaxe",
    label: "+1 Pico",
    action: (stats: any) => (stats.inventory.pickaxe += 1),
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
  bonus: any;
  icon: "attack" | "energy" | "pickaxe" | "crit";
}

// DEFINICIÓN DEL POOL DE CARTAS INDIVIDUALES
const CARD_POOL: Card[] = [
  // --- COMUNES (Blancas) ---
  {
    name: "Afilado Básico",
    type: "Común",
    color: "#ffffff",
    bonus: { attack: 1 },
    icon: "attack",
  },
  {
    name: "Bebida Energética",
    type: "Común",
    color: "#ffffff",
    bonus: { energy: 15 },
    icon: "energy",
  },
  {
    name: "Pico de Madera",
    type: "Común",
    color: "#ffffff",
    bonus: { pickaxe: 2 },
    icon: "pickaxe",
  },

  // --- RARAS (Azules) ---
  {
    name: "Entrenamiento Real",
    type: "Rara",
    color: "#4592e5",
    bonus: { attack: 3 },
    icon: "attack",
  },
  {
    name: "Corazón de Hierro",
    type: "Rara",
    color: "#4592e5",
    bonus: { maxEnergy: 20 },
    icon: "energy",
  },
  {
    name: "Ojo de Halcón",
    type: "Rara",
    color: "#4592e5",
    bonus: { crit: 0.05 },
    icon: "crit",
  },

  // --- ÉPICAS (Moradas) ---
  {
    name: "Furia del Berserker",
    type: "Épica",
    color: "#b145e5",
    bonus: { attack: 5, crit: 0.1 },
    icon: "attack",
  },
  {
    name: "Cinturón de Minero",
    type: "Épica",
    color: "#b145e5",
    bonus: { pickaxe: 8 },
    icon: "pickaxe",
  },
  {
    name: "Mega Vitamina",
    type: "Épica",
    color: "#b145e5",
    bonus: { maxEnergy: 40 },
    icon: "energy",
  },

  // --- LEGENDARIAS (Naranjas/Doradas) ---
  {
    name: "Bendición del Titán",
    type: "Legendaria",
    color: "#ff8c00",
    bonus: { attack: 10, crit: 0.2 },
    icon: "attack",
  },
  {
    name: "Pico de Diamante Ancestral",
    type: "Legendaria",
    color: "#ff8c00",
    bonus: { pickaxe: 15, energy: 50 },
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
