import React, { useContext } from "react";
import { useActor } from "@xstate/react";
import { PortalContext } from "../lib/PortalProvider";
import { InnerPanel } from "components/ui/Panel";
import { Label } from "components/ui/Label";
import { SUNNYSIDE } from "assets/sunnyside";
import { ENEMY_TYPES, EnemyType } from "../lib/Enemies";
import { LEVEL_DESIGNS, DUNGEON_POINTS } from "../DeepDungeonConstants";

// --- 1. Definimos el Slot visual aquí mismo para evitar el error de ReferenceError ---
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
}> = ({ name, current, total, image, hp, atk, def, crit, damageAoE }) => {
  // 1. Buscamos si el nombre existe en CRYSTALS
  const crystalPoints =
    DUNGEON_POINTS.CRYSTALS[name as keyof typeof DUNGEON_POINTS.CRYSTALS];

  // 2. Buscamos si el nombre existe en ENEMIES (lo ponemos en mayúsculas por si acaso)
  const enemyPoints =
    DUNGEON_POINTS.ENEMIES[
      name.toUpperCase() as keyof typeof DUNGEON_POINTS.ENEMIES
    ];

  // 3. Determinamos el valor final a mostrar
  const points = crystalPoints || enemyPoints || 0;
  const isComplete = current >= total;

  return (
    <div className="flex flex-col items-center bg-[#ead4aa] border border-[#754733] p-2 rounded-sm relative w-full h-full min-h-[180px]">
      {/* 1. NOMBRE CENTRADO */}
      <div className="w-full flex justify-center items-center mb-2">
        <span className="text-[6px] font-pixel text-brown-800 uppercase text-center leading-tight">
          {name.replace(/_/g, " ")}
        </span>
      </div>

      {/* 2. IMAGEN DEL ENEMIGO */}
      <img
        src={image}
        className="w-8 h-8 object-contain mb-2"
        style={{ imageRendering: "pixelated" }}
        onError={(e) => (e.currentTarget.src = "assets/icons/unknown.png")}
      />

      {/* 3. STATS CENTRADOS (Usamos flex-wrap y justify-center) */}
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

      {/* MOSTRAR LOS PUNTOS SI EXISTEN */}
      {points > 0 && (
        <div className="text-[8px] font-pixel text-green-700 mb-1">
          {`${points} Points`}
        </div>
      )}
      {/* 4. PROGRESO AL FINAL */}
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

  // 1. Seguridad total: si no hay contexto, devolvemos un panel vacío
  if (!portalState.context) return null;

  const { stats, levelProgress } = portalState.context;
  const currentLevel = stats.currentLevel;
  const levelData = LEVEL_DESIGNS[currentLevel];

  if (!levelData) return null;

  // 2. Aseguramos que levelProgress exista para evitar errores de lectura
  const progress = levelProgress || { enemies: {}, crystals: {} };

  return (
    <InnerPanel className="flex flex-col h-full overflow-y-auto scrollable p-2">
      <div className="space-y-3">
        <Label
          type="formula"
          icon={
            category === "Enemies"
              ? SUNNYSIDE.icons.expression_confused
              : SUNNYSIDE.icons.search
          }
        >
          {`${category} - Map ${currentLevel}`}
        </Label>

        <div className="grid grid-cols-4 gap-2">
          {category === "Enemies" &&
            levelData.enemies.map((enemy) => {
              // Declaramos todo aquí dentro para que esté disponible en el renderizado

              const staticStats =
                ENEMY_TYPES[enemy.type.toUpperCase() as EnemyType];

              const typeKey = enemy.type.toLowerCase();
              const currentCount =
                portalState.context.levelProgress?.enemies?.[typeKey] || 0;

              return (
                <DungeonItemSlot
                  // 🟢 AL CAMBIAR EL NIVEL, LA KEY CAMBIA Y EL COMPONENTE SE RESETEA A 0
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
                />
              );
            })}

          {category === "Crystals" &&
            levelData.crystals.map((c) => {
              const itemKey = `${c.type}_crystal_${c.level}`;
              return (
                <DungeonItemSlot
                  key={`${currentLevel}-${itemKey}`} // Key única por nivel
                  name={itemKey}
                  current={progress.crystals[itemKey] || 0}
                  total={c.count}
                  image={`world/DeepDungeonAssets/${itemKey}.png`}
                />
              );
            })}
        </div>
      </div>
    </InnerPanel>
  );
};
