import React from "react";
import { InnerPanel } from "components/ui/Panel";
import { Label } from "components/ui/Label";
import { SUNNYSIDE } from "assets/sunnyside";
import { ITEM_DETAILS } from "features/game/types/images";
// Importa tus constantes de Phaser/Dungeon
import { DROP_ITEMS_CONFIG } from "../DeepDungeonConstants";
import { ENEMY_TYPES } from "../lib/Enemies";

export const DungeonDrops: React.FC = () => {
  // Extraemos los enemigos que tienen lootTable definida
  const enemiesWithLoot = Object.entries(ENEMY_TYPES).filter(
    ([_, config]) => config.lootTable && config.lootTable.length > 0,
  );

  return (
    <InnerPanel className="flex flex-col h-full overflow-y-auto scrollable p-2">
      <div className="space-y-4">
        <Label
          type="warning"
          icon={SUNNYSIDE.icons.treasure}
          className="mb-2 ml-1"
        >
          {"Enemy Loot Tables"}
        </Label>

        {enemiesWithLoot.map(([key, config]) => (
          <div
            key={key}
            className="bg-[#d4a373] border-2 border-[#754733] p-2 rounded-sm shadow-sm"
          >
            {/* Cabecera del Enemigo */}
            <div className="flex items-center mb-2 justify-between">
              <span className="font-pixel text-[10px] uppercase text-brown-700">
                {config.name}
              </span>
              <span className="text-[7px] font-pixel text-brown-600 opacity-80">
                {`Drop Chance:`} {config.dropChance * 100}
                {`%`}
              </span>
            </div>

            <div className="h-[1px] bg-[#754733] w-full mb-2 opacity-30" />

            {/* Listado de Drops */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {config.lootTable?.map((loot, i) => {
                // Buscamos la info visual en DROP_ITEMS_CONFIG o ITEM_DETAILS
                const itemInfo =
                  DROP_ITEMS_CONFIG[loot.key as keyof typeof DROP_ITEMS_CONFIG];
                const displayName = itemInfo?.label || loot.key;

                return (
                  <div
                    key={i}
                    className="flex items-center bg-[#ead4aa] border border-[#754733] px-2 py-1 rounded-sm"
                  >
                    {/* Icono: Intenta usar ITEM_DETAILS, si no, usa el sprite del config */}
                    <img
                      src={
                        ITEM_DETAILS[displayName as keyof typeof ITEM_DETAILS]
                          ?.image ||
                        `world/DeepDungeonAssets/${loot.key.toLowerCase()}.png`
                      }
                      className="w-5 h-5 mr-2 object-contain"
                      alt={displayName}
                    />

                    <div className="flex flex-col">
                      <span className="text-[7px] font-pixel text-black uppercase leading-none">
                        {displayName}
                      </span>
                      <span className="text-[6px] font-pixel text-green-700 mt-1">
                        {Math.round(loot.weight * 100)}
                        {`% Chance`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {enemiesWithLoot.length === 0 && (
          <p className="font-pixel text-[8px] text-center mt-4">{`No loot data available`}</p>
        )}
      </div>
    </InnerPanel>
  );
};
