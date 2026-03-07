import React, { useContext } from "react";
import { useActor } from "@xstate/react";
import { PortalContext } from "../lib/PortalProvider";
import { InnerPanel } from "components/ui/Panel";
import { Label } from "components/ui/Label";
import { SUNNYSIDE } from "assets/sunnyside";
import { LEVEL_DESIGNS } from "../DeepDungeonConstants";
import { ENEMY_TYPES, EnemyType } from "../lib/Enemies";

// --- 1. Definimos el Slot visual aquí mismo para evitar el error de ReferenceError ---
const DungeonItemSlot: React.FC<{
  name: string;
  current: number;
  total: number;
  image: string;
  hp?: number;
  atk?: number;
  def?: number;
  crit?: number; // Nueva prop para el crítico
}> = ({ name, current, total, image, hp, atk, def, crit }) => {
  const isComplete = current >= total;

  return (
    <div className="flex flex-col items-center bg-[#ead4aa] border border-[#754733] p-1 rounded-sm relative w-full h-full min-h-[110px]">
      {/* 🟢 AJUSTE DE NOMBRE: Contenedor con altura mínima y texto auto-ajustable */}
      <div className="w-full flex justify-center items-center min-h-[18px] mb-1 px-0.5">
        <span
          className="text-[5px] font-pixel text-brown-800 uppercase text-center leading-tight break-all"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {name.replace(/_/g, " ")}{" "}
          {/* Limpiamos los guiones bajos para que quepa mejor */}
        </span>
      </div>

      {/* Imagen del Item */}
      <div className="flex-1 flex items-center justify-center">
        <img
          src={image}
          className="w-7 h-7 object-contain"
          alt={name}
          style={{ imageRendering: "pixelated" }}
          onError={(e) => (e.currentTarget.src = "assets/icons/unknown.png")}
        />
      </div>

      {/* Estadísticas de combate: Compactadas para dejar espacio al nombre */}
      <div className="grid grid-cols-2 gap-x-1 gap-y-[1px] mt-1 mb-1 leading-none w-full border-t border-brown-600/20 pt-1">
        {hp !== undefined && (
          <div className="flex items-center justify-center gap-0.5">
            {/* Usamos la ruta directa que definiste en Phaser */}

            <span className="text-[6px] font-pixel text-red-700">{hp}</span>
            <img
              src="world/DeepDungeonAssets/heart.png"
              alt="Heart"
              className="w-3.5 h-3.5 object-contain" // w-1.5 es aprox 6px, ajusta según necesites
            />
          </div>
        )}
        {atk !== undefined && (
          <div className="flex items-center justify-center gap-0.5">
            {/* Usamos la ruta directa que definiste en Phaser */}

            <span className="text-[6px] font-pixel text-red-700">{hp}</span>
            <img
              src="world/DeepDungeonAssets/sword.png"
              alt="Sword"
              className="w-3.5 h-3.5 object-contain" // w-1.5 es aprox 6px, ajusta según necesites
            />
          </div>
        )}
        {def !== undefined && (
          <div className="flex items-center justify-center gap-0.5">
            {/* Usamos la ruta directa que definiste en Phaser */}

            <span className="text-[6px] font-pixel text-red-700">{def}</span>
            <img
              src="world/DeepDungeonAssets/shield.png"
              alt="Shield"
              className="w-3.5 h-3.5 object-contain" // w-1.5 es aprox 6px, ajusta según necesites
            />
          </div>
        )}
        {crit !== undefined && (
          <div className="flex items-center justify-center gap-0.5">
            {/* Usamos la ruta directa que definiste en Phaser */}

            <span className="text-[6px] font-pixel text-red-700">
              {`${crit * 100}%`}
            </span>
            <img
              src="world/DeepDungeonAssets/crit.png"
              alt="Crit"
              className="w-3.5 h-3.5 object-contain" // w-1.5 es aprox 6px, ajusta según necesites
            />
          </div>
        )}
      </div>

      {/* Progreso: Barra inferior limpia */}
      <div className="flex items-center gap-1 mt-auto w-full justify-center bg-brown-200/30 rounded-sm py-0.5">
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
                  def={staticStats?.defense}
                  crit={staticStats?.criticalChance}
                />
              );
            })}

          {category === "Crystals" &&
            levelData.crystals.map((c) => {
              const itemKey = `mena_${c.type}_${c.level}`;
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
