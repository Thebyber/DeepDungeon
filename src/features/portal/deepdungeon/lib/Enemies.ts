import { DropKey } from "../DeepDungeonConstants";

export interface EnemyStats {
  name: string;
  hp: number;
  damage: number;
  defense: number;
  trapDamage: number;
  sprite: string;
  isAggressive: boolean;
  isRanged: boolean;
  damageAoE: number; // Solo para enemigos con ataque de área
  criticalChance?: number;
  dropChance: number; // Probabilidad de que suelte ALGO (ej: 0.5 = 50%)
  lootTable: { key: DropKey; weight: number }[]; // Lista de posibles objetos
}

export type EnemyType = "SKELETON" | "KNIGHT" | "FRANKENSTEIN" | "DEVIL";

export const ENEMY_TYPES: Record<EnemyType, EnemyStats> = {
  SKELETON: {
    name: "skeleton",
    hp: 3,
    damage: 2,
    defense: 2,
    criticalChance: 0.05,
    trapDamage: 1,
    damageAoE: 0,
    sprite: "skeleton",
    isAggressive: false,
    isRanged: false,
    dropChance: 0.7, // 70% de soltar algo
    lootTable: [
      { key: "DEFENSE", weight: 0.25 },
      { key: "ATTACK", weight: 0.25 },
      { key: "CRIT", weight: 0.25 },
      { key: "PICKAXE", weight: 0.25 },
    ],
  },
  KNIGHT: {
    name: "knight",
    hp: 10,
    damage: 5,
    defense: 6,
    criticalChance: 0.1,
    trapDamage: 0,
    damageAoE: 0,
    sprite: "knight",
    isAggressive: false,
    isRanged: false,
    dropChance: 0.8, // 80% de soltar algo
    lootTable: [
      { key: "DEFENSE", weight: 0.7 },
      { key: "ATTACK", weight: 0.1 },
      { key: "CRIT", weight: 0.1 },
      { key: "PICKAXE", weight: 0.1 },
    ],
  },
  FRANKENSTEIN: {
    name: "frankenstein",
    hp: 20,
    damage: 8,
    defense: 10,
    trapDamage: 1,
    criticalChance: 0.15,
    sprite: "frankenstein",
    isAggressive: true,
    isRanged: false,
    damageAoE: 5,
    dropChance: 1,
    lootTable: [
      { key: "DEFENSE", weight: 0.1 },
      { key: "ATTACK", weight: 0.7 },
      { key: "CRIT", weight: 0.1 },
      { key: "PICKAXE", weight: 0.1 },
    ],
  },
  DEVIL: {
    name: "devil",
    hp: 15,
    damage: 5,
    defense: 5,
    criticalChance: 0.2,
    trapDamage: 1,
    sprite: "devil",
    isAggressive: true,
    isRanged: true,
    damageAoE: 10,
    dropChance: 1, // Daño adicional a los tiles adyacentes
    lootTable: [
      { key: "DEFENSE", weight: 0.1 },
      { key: "ATTACK", weight: 0.1 },
      { key: "CRIT", weight: 0.7 },
      { key: "PICKAXE", weight: 0.1 },
    ],
  },
};

/*export const ENEMIES_TABLE: {
  image: string;
  //description: string;
  width?: number;
}[] = [
  {
    image: ITEM_DETAILS["Alien Chicken"].image, // Cambiar por skeleton, añadir en features/game/types/images.ts -> import skeleton from "assets/halloween/mummy.png"; y en export const ITEM_DETAILS: Items =
    //description: translate("halloween.ghostEnemyDescription"), //añadirla en src/lib/i18n/dictionaries/dictionary.json
  },
];*/
