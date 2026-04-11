import React, { useState } from "react";
import { InnerPanel } from "components/ui/Panel";
import { Label } from "components/ui/Label";
import { SUNNYSIDE } from "assets/sunnyside";
import {
  DROP_ITEMS_CONFIG,
  CRYSTAL_DROP_TABLE,
  DUNGEON_POINTS,
} from "../DeepDungeonConstants";
import { ENEMY_TYPES } from "../lib/Enemies";

// ─── Helpers ───────────────────────────────────────────────────────────────

const CRYSTAL_COLORS = ["pink", "white", "blue", "prismora"] as const;
const CRYSTAL_COLOR_LABELS: Record<string, string> = {
  pink: "Pink",
  white: "White",
  blue: "Blue",
  prismora: "Prismora",
};
const CRYSTAL_COLOR_BG: Record<string, string> = {
  pink: "#f7a8c0",
  white: "#e8e8e8",
  blue: "#89b4f7",
  prismora: "#c9a0f7",
};
const CRYSTAL_COLOR_BORDER: Record<string, string> = {
  pink: "#d4607a",
  white: "#999999",
  blue: "#3a6bbf",
  prismora: "#7b3fbf",
};

// ─── Sub-components ────────────────────────────────────────────────────────

const StatBadge: React.FC<{
  value: number | string;
  icon: string;
  color: string;
}> = ({ value, icon, color }) => (
  <div className="flex items-center gap-0.5">
    <span className={`text-[6px] font-pixel ${color}`}>{value}</span>
    <img
      src={icon}
      className="w-3.5 h-3.5"
      style={{ imageRendering: "pixelated" }}
      alt=""
    />
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────

export const DungeonDrops: React.FC = () => {
  const [tab, setTab] = useState<"enemies" | "crystals">("enemies");

  return (
    <InnerPanel className="flex flex-col h-full p-2">
      {/* Tabs */}
      <div className="flex gap-1 mb-2">
        <button
          className={`font-pixel text-[7px] uppercase px-2 py-1 rounded-sm border transition-colors ${
            tab === "enemies"
              ? "bg-[#ead4aa] border-[#754733] text-brown-900"
              : "bg-transparent border-transparent text-brown-600 hover:text-brown-800"
          }`}
          onClick={() => setTab("enemies")}
        >
          <div className="flex items-center gap-1">
            <img
              src="/world/DeepDungeonAssets/skull.png"
              className="w-3 h-3"
              alt=""
            />
            {`Enemies`}
          </div>
        </button>
        <button
          className={`font-pixel text-[7px] uppercase px-2 py-1 rounded-sm border transition-colors ${
            tab === "crystals"
              ? "bg-[#ead4aa] border-[#754733] text-brown-900"
              : "bg-transparent border-transparent text-brown-600 hover:text-brown-800"
          }`}
          onClick={() => setTab("crystals")}
        >
          <div className="flex items-center gap-1">
            <img
              src="/world/DeepDungeonAssets/bag_crystal.png"
              className="w-3 h-3"
              alt=""
            />
            {`Crystals`}
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollable pr-1 space-y-3">
        {/* ── ENEMIES TAB ── */}
        {tab === "enemies" && (
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(ENEMY_TYPES).map(([key, config]) => {
              const points =
                DUNGEON_POINTS.ENEMIES[
                  key as keyof typeof DUNGEON_POINTS.ENEMIES
                ] ?? 0;
              const totalWeight = config.lootTable.reduce(
                (s, d) => s + d.weight,
                0,
              );
              return (
                <div
                  key={key}
                  className="flex flex-col items-center bg-[#ead4aa] border border-[#754733] p-2 rounded-sm"
                >
                  {/* Nombre */}
                  <span className="text-[7px] font-pixel text-brown-800 uppercase text-center mb-1">
                    {config.name}
                  </span>

                  {/* Imagen */}
                  <img
                    src={`world/DeepDungeonAssets/${config.sprite}.png`}
                    className="w-8 h-8 object-contain mb-2"
                    style={{ imageRendering: "pixelated" }}
                    onError={(e) => (e.currentTarget.style.display = "none")}
                    alt={config.name}
                  />

                  {/* Stats */}
                  <div className="w-full border-t border-brown-600/20 pt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 mb-2">
                    <StatBadge
                      value={config.hp}
                      icon="world/DeepDungeonAssets/heart.png"
                      color="text-red-700"
                    />
                    <StatBadge
                      value={config.damage}
                      icon="world/DeepDungeonAssets/sword.png"
                      color="text-orange-700"
                    />
                    <StatBadge
                      value={config.defense}
                      icon="world/DeepDungeonAssets/shield.png"
                      color="text-blue-700"
                    />
                    {config.criticalChance !== undefined && (
                      <StatBadge
                        value={`${Math.round(config.criticalChance * 100)}%`}
                        icon="world/DeepDungeonAssets/crit.png"
                        color="text-purple-700"
                      />
                    )}
                    {config.damageAoE > 0 && (
                      <StatBadge
                        value={config.damageAoE}
                        icon="world/DeepDungeonAssets/AoEatq.png"
                        color="text-orange-600"
                      />
                    )}
                  </div>

                  {/* Puntos */}
                  {points > 0 && (
                    <div className="text-[8px] font-pixel text-green-700 mb-1">
                      {points}
                      {` Points`}
                    </div>
                  )}

                  {/* Drops */}
                  <div className="w-full border-t border-brown-600/20 pt-1 mt-1">
                    <div className="flex items-center gap-1 justify-center mb-1">
                      <img
                        src={SUNNYSIDE.icons.treasure}
                        className="w-2.5 h-2.5"
                        alt="drop"
                      />
                      <span className="text-[5px] font-pixel text-brown-700 uppercase">
                        {config.dropChance * 100}
                        {`% Drop`}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      {config.lootTable.map((loot) => {
                        const info =
                          DROP_ITEMS_CONFIG[
                            loot.key as keyof typeof DROP_ITEMS_CONFIG
                          ];
                        const chance = Math.round(
                          config.dropChance * (loot.weight / totalWeight) * 100,
                        );
                        return (
                          <div
                            key={loot.key}
                            className="flex items-center gap-1 justify-between px-1"
                          >
                            <div className="flex items-center gap-0.5">
                              <img
                                src={`world/DeepDungeonAssets/${info?.sprite ?? loot.key.toLowerCase()}.png`}
                                className="w-3 h-3"
                                style={{ imageRendering: "pixelated" }}
                                alt={loot.key}
                              />
                              <span className="text-[5px] font-pixel text-brown-800">
                                {info?.label ?? loot.key}
                              </span>
                            </div>
                            <span className="text-[5px] font-pixel text-green-700">
                              {chance}
                              {`%`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── CRYSTALS TAB ── */}
        {tab === "crystals" &&
          CRYSTAL_COLORS.map((color) => (
            <div key={color}>
              {/* Color group header */}
              <Label type="default">
                {CRYSTAL_COLOR_LABELS[color]}
                {` Crystals`}
              </Label>

              <div className="grid grid-cols-3 gap-2 mb-3">
                {[1, 2, 3, 4, 5].map((level) => {
                  const key = `${color}_crystal_${level}`;
                  const dropTable = CRYSTAL_DROP_TABLE[key];
                  const points =
                    DUNGEON_POINTS.CRYSTALS[
                      key as keyof typeof DUNGEON_POINTS.CRYSTALS
                    ] ?? 0;

                  if (!dropTable) return null;

                  const totalWeight = dropTable.energyDrops.reduce(
                    (s, d) => s + d.weight,
                    0,
                  );

                  return (
                    <div
                      key={key}
                      className="flex flex-col items-center bg-[#ead4aa] border border-[#754733] p-2 rounded-sm"
                    >
                      {/* Nombre */}
                      <span className="text-[6px] font-pixel text-brown-800 uppercase text-center mb-1">
                        {`${CRYSTAL_COLOR_LABELS[color]} Lv.${level}`}
                      </span>

                      {/* Imagen */}
                      <img
                        src={`world/DeepDungeonAssets/${key}.png`}
                        className="w-8 h-8 object-contain mb-2"
                        style={{ imageRendering: "pixelated" }}
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                        alt={key}
                      />

                      {/* Puntos */}
                      {points > 0 && (
                        <div className="text-[8px] font-pixel text-green-700 mb-1">
                          {points}
                          {` Points`}
                        </div>
                      )}

                      {/* Energy drops */}
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
                          {dropTable.energyDrops.map((drop) => (
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
                                {Math.round((drop.weight / totalWeight) * 100)}
                                {`%`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
    </InnerPanel>
  );
};
