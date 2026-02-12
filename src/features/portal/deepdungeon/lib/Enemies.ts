import { ITEM_DETAILS } from "features/game/types/images";

export interface EnemyStats {
  name: string;
  hp: number;
  damage: number;
  defense: number;
  sprite: string;
}

export type EnemyType = "SLIME" | "SLIME_BOSS" | "SKELETON";

export const ENEMY_TYPES: Record<EnemyType, EnemyStats> = {
  SLIME: {
    name: "Slime",
    hp: 1,
    damage: 1,
    defense: 1,
    sprite: "slime_green", // Asegúrate de tener este asset cargado
  },
  SLIME_BOSS: {
    name: "Slime Jefe",
    hp: 3,
    damage: 3,
    defense: 3,
    sprite: "slime_giant",
  },
  SKELETON: {
    name: "Esqueleto",
    hp: 2,
    damage: 2,
    defense: 2,
    sprite: "world/DeepDungeonAssets/skeleton.png",
  },
};

export const ENEMIES_TABLE: {
  image: string;
  //description: string;
  width?: number;
}[] = [
  {
    image: ITEM_DETAILS["Alien Chicken"].image, // Cambiar por skeleton, añadir en features/game/types/images.ts -> import skeleton from "assets/halloween/mummy.png"; y en export const ITEM_DETAILS: Items =
    //description: translate("halloween.ghostEnemyDescription"), //añadirla en src/lib/i18n/dictionaries/dictionary.json
  },
];
