import React, { useContext } from "react";
import { useActor } from "@xstate/react";
import { PortalContext } from "../lib/PortalProvider";
import { InnerPanel } from "components/ui/Panel";
import { Label } from "components/ui/Label";
import { SUNNYSIDE } from "assets/sunnyside";
import { ENEMY_TYPES, EnemyType } from "../lib/Enemies";
import {
  LEVEL_DESIGNS,
  DUNGEON_POINTS,
  CRYSTAL_DROP_TABLE,
  DROP_ITEMS_CONFIG,
} from "../DeepDungeonConstants";

interface EnergyDrop {
  amount: number;
  chance: number;
}

interface LootDrop {
  sprite: string;
  label: string;
  chance: number;
}

const DungeonItemSlot: React.FC<{
  name: string;
  current: number;
  total: number;
  image: string;
  hp?: number;
  atk?: number;
  def?: number;
  crit?: number;
  damageAoE?: number;
  energyDrops?: EnergyDrop[];
  lootDrops?: LootDrop[];
  dropChance?: number;
}> = ({
  name,
  current,
  total,
  image,
  hp,
  atk,
  def,
  crit,
  damageAoE,
  energyDrops,
  lootDrops,
  dropChance,
}) => {
  const crystalPoints =
    DUNGEON_POINTS.CRYSTALS[name as keyof typeof DUNGEON_POINTS.CRYSTALS];
  const enemyPoints =
    DUNGEON_POINTS.ENEMIES[
      name.toUpperCase() as keyof typeof DUNGEON_POINTS.ENEMIES
    ];
  const points = crystalPoints || enemyPoints || 0;
  const isComplete = current >= total;

  return (
    <div className="flex flex-col items-center bg-[#ead4aa] border border-[#754733] p-2 rounded-sm relative w-full h-full min-h-[180px]">
      {/* NOMBRE */}
      <div className="w-full flex justify-center items-center mb-2">
        <span className="text-[6px] font-pixel text-brown-800 uppercase text-center leading-tight">
          {name.replace(/_/g, " ")}
        </span>
      </div>

      {/* IMAGEN */}
      <img
        src={image}
        className="w-8 h-8 object-contain mb-2"
        style={{ imageRendering: "pixelated" }}
        onError={(e) => (e.currentTarget.src = "assets/icons/unknown.png")}
      />

      {/* STATS ENEMIGOS */}
      <div className="w-full border-t border-brown-600/20 pt-2 flex flex-wrap justify-center gap-x-3 gap-y-2 mb-2">
        {hp !== undefined && (
          <div className="flex items-center gap-1">
            <span className="text-[6px] font-pixel text-red-700">{hp}</span>
            <img
              src="world/DeepDungeonAssets/heart.png"
              className="w-5 h-5"
              alt="HP"
            />
          </div>
        )}
        {atk !== undefined && (
          <div className="flex items-center gap-1">
            <span className="text-[6px] font-pixel text-orange-700">{atk}</span>
            <img
              src="world/DeepDungeonAssets/sword.png"
              className="w-5 h-5"
              alt="ATK"
            />
          </div>
        )}
        {def !== undefined && (
          <div className="flex items-center gap-1">
            <span className="text-[6px] font-pixel text-blue-700">{def}</span>
            <img
              src="world/DeepDungeonAssets/shield.png"
              className="w-5 h-5"
              alt="DEF"
            />
          </div>
        )}
        {crit !== undefined && (
          <div className="flex items-center gap-1">
            <span className="text-[6px] font-pixel text-purple-700">
              {Math.round(crit * 100)}
              {"%"}
            </span>
            <img
              src="world/DeepDungeonAssets/crit.png"
              className="w-5 h-5"
              alt="CRIT"
            />
          </div>
        )}
        {damageAoE !== undefined && damageAoE > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-[6px] font-pixel text-orange-600">
              {damageAoE}
            </span>
            <img
              src="world/DeepDungeonAssets/AoEatq.png"
              className="w-5 h-5"
              alt="AoE"
            />
          </div>
        )}
      </div>

      {/* PUNTOS */}
      {points > 0 && (
        <div className="text-[8px] font-pixel text-green-700 mb-1">
          {`${points} Points`}
        </div>
      )}

      {/* DROPS DE LOOT (ENEMIGOS) */}
      {lootDrops && lootDrops.length > 0 && (
        <div className="w-full border-t border-brown-600/20 pt-1 mt-1">
          <div className="flex items-center gap-1 justify-center mb-1">
            <img
              src={SUNNYSIDE.icons.treasure}
              className="w-2.5 h-2.5"
              alt="drops"
            />
            <span className="text-[5px] font-pixel text-brown-700 uppercase">
              {dropChance !== undefined
                ? `${Math.round(dropChance * 100)}% drop`
                : `Drops`}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            {lootDrops.map((drop) => (
              <div
                key={drop.sprite}
                className="flex items-center gap-1 justify-between px-1"
              >
                <div className="flex items-center gap-0.5">
                  <img
                    src={`world/DeepDungeonAssets/${drop.sprite}.png`}
                    className="w-3 h-3"
                    style={{ imageRendering: "pixelated" }}
                    alt={drop.sprite}
                  />
                  <span className="text-[5px] font-pixel text-brown-800">
                    {drop.label}
                  </span>
                </div>
                <span className="text-[5px] font-pixel text-green-700">
                  {drop.chance}
                  {`%`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DROPS DE ENERGÍA */}
      {energyDrops && energyDrops.length > 0 && (
        <div className="w-full border-t border-brown-600/20 pt-1 mt-1">
          <div className="flex items-center gap-1 justify-center mb-1">
            <img
              src={SUNNYSIDE.icons.treasure}
              className="w-2.5 h-2.5"
              alt="energy"
            />
            <span className="text-[5px] font-pixel text-brown-700 uppercase">
              {`Energy drops`}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            {energyDrops.map((drop) => (
              <div
                key={drop.amount}
                className="flex items-center gap-1 justify-between px-1"
              >
                <div className="flex items-center gap-0.5">
                  <img
                    src={SUNNYSIDE.icons.lightning}
                    className="w-3 h-3"
                    alt="energy"
                  />
                  <span className="text-[5px] font-pixel text-brown-800">
                    {`+${drop.amount} energy`}
                  </span>
                </div>
                <span className="text-[5px] font-pixel text-green-700">
                  {drop.chance}
                  {`%`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROGRESO */}
      <div className="flex items-center gap-1 mt-auto w-full justify-center bg-brown-200/40 rounded-sm py-1">
        <span
          className={`text-[8px] font-pixel ${isComplete ? "text-green-700" : "text-brown-700"}`}
        >
          {`${current}/${total}`}
        </span>
        {isComplete && (
          <img src={SUNNYSIDE.icons.confirm} className="w-2.5" alt="ok" />
        )}
      </div>
    </div>
  );
};

export const DungeonProgress: React.FC<{
  category: "Enemies" | "Crystals";
}> = ({ category }) => {
  const { portalService } = useContext(PortalContext);
  const [portalState] = useActor(portalService);

  if (!portalState.context) return null;

  const { stats, levelProgress } = portalState.context;
  const currentLevel = stats.currentLevel;
  const levelData = LEVEL_DESIGNS[currentLevel];

  if (!levelData) return null;

  const progress = levelProgress || { enemies: {}, crystals: {} };

  return (
    <InnerPanel className="flex flex-col h-full overflow-y-auto scrollable p-2">
      <div className="space-y-3">
        <Label
          type="formula"
          icon={
            category === "Enemies"
              ? SUNNYSIDE.icons.death
              : SUNNYSIDE.icons.hammer
          }
        >
          {`${category} - Map ${currentLevel}`}
        </Label>

        <div className="grid grid-cols-2 gap-2">
          {category === "Enemies" &&
            levelData.enemies.map((enemy) => {
              const staticStats =
                ENEMY_TYPES[enemy.type.toUpperCase() as EnemyType];
              const typeKey = enemy.type.toLowerCase();
              const currentCount =
                portalState.context.levelProgress?.enemies?.[typeKey] || 0;

              let lootDrops: LootDrop[] | undefined;
              if (staticStats?.lootTable && staticStats.lootTable.length > 0) {
                const totalWeight = staticStats.lootTable.reduce(
                  (sum, d) => sum + d.weight,
                  0,
                );
                lootDrops = staticStats.lootTable.map((d) => {
                  const config = DROP_ITEMS_CONFIG[d.key];
                  return {
                    sprite: config?.sprite ?? d.key.toLowerCase(),
                    label: config?.label ?? d.key,
                    chance: Math.round(
                      staticStats.dropChance * (d.weight / totalWeight) * 100,
                    ),
                  };
                });
              }

              return (
                <DungeonItemSlot
                  key={`level-${stats.currentLevel}-${typeKey}`}
                  name={
                    ENEMY_TYPES[enemy.type.toUpperCase() as EnemyType]?.name ||
                    enemy.type
                  }
                  current={currentCount}
                  total={enemy.count}
                  image={`world/DeepDungeonAssets/${typeKey}.png`}
                  hp={staticStats?.hp}
                  atk={staticStats?.damage}
                  damageAoE={staticStats?.damageAoE}
                  def={staticStats?.defense}
                  crit={staticStats?.criticalChance}
                  lootDrops={lootDrops}
                  dropChance={staticStats?.dropChance}
                />
              );
            })}

          {category === "Crystals" &&
            levelData.crystals.map((c) => {
              const itemKey = `${c.type}_crystal_${c.level}`;
              const dropTable = CRYSTAL_DROP_TABLE[itemKey];
              let energyDrops: EnergyDrop[] | undefined;

              if (dropTable) {
                const totalWeight = dropTable.energyDrops.reduce(
                  (sum, d) => sum + d.weight,
                  0,
                );
                energyDrops = dropTable.energyDrops.map((d) => ({
                  amount: d.amount,
                  chance: Math.round((d.weight / totalWeight) * 100),
                }));
              }

              return (
                <DungeonItemSlot
                  key={`${currentLevel}-${itemKey}`}
                  name={itemKey}
                  current={progress.crystals[itemKey] || 0}
                  total={c.count}
                  image={`world/DeepDungeonAssets/${itemKey}.png`}
                  energyDrops={energyDrops}
                />
              );
            })}
        </div>
      </div>
    </InnerPanel>
  );
};
