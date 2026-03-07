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
  damageAoE?: number; // Solo para enemigos con ataque de área
  criticalChance?: number;
  dropChance: number; // Probabilidad de que suelte ALGO (ej: 0.5 = 50%)
  lootTable: { key: DropKey; weight: number }[]; // Lista de posibles objetos
}

export type EnemyType = "SKELETON" | "KNIGHT" | "FRANKENSTEIN" | "DEVIL";

export const ENEMY_TYPES: Record<EnemyType, EnemyStats> = {
  SKELETON: {
    name: "skeleton",
    hp: 5,
    damage: 1,
    defense: 2,
    trapDamage: 1,
    sprite: "skeleton",
    isAggressive: false,
    isRanged: false,
    dropChance: 1, // 100% de soltar algo
    lootTable: [
      { key: "ENERGY_5", weight: 0.2 }, // Muy común
      { key: "DEFENSE", weight: 0.7 }, // Raro
      { key: "PICKAXE", weight: 0.1 }, // Muy raro
    ],
  },
  KNIGHT: {
    name: "knight",
    hp: 4,
    damage: 4,
    defense: 2,
    criticalChance: 0.1,
    trapDamage: 0,
    sprite: "knight",
    isAggressive: false,
    isRanged: false,
    dropChance: 1,
    lootTable: [
      //{ key: 'ENERGY_5', weight: 0.2 },  // Muy común
      { key: "DEFENSE", weight: 0.7 }, // Raro
      { key: "ATTACK", weight: 0.3 }, // Muy raro
    ],
  },
  FRANKENSTEIN: {
    name: "frankenstein",
    hp: 2,
    damage: 5,
    defense: 4,
    trapDamage: 1,
    criticalChance: 0.2,
    sprite: "frankenstein",
    isAggressive: true,
    isRanged: false,
    damageAoE: 1,
    dropChance: 1, // 40% de soltar algo
    lootTable: [
      //{ key: 'ENERGY_5', weight: 0.2 },  // Muy común
      { key: "DEFENSE", weight: 0.7 }, // Raro
      { key: "ATTACK", weight: 0.3 }, // Muy raro
    ],
  },
  DEVIL: {
    name: "devil",
    hp: 5,
    damage: 2,
    defense: 2,
    trapDamage: 1,
    sprite: "devil",
    isAggressive: true,
    isRanged: true,
    damageAoE: 1,
    dropChance: 1, // Daño adicional a los tiles adyacentes
    lootTable: [
      //{ key: 'ENERGY_5', weight: 0.2 },  // Muy común
      { key: "DEFENSE", weight: 0.7 }, // Raro
      { key: "ATTACK", weight: 0.3 }, // Muy raro
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
