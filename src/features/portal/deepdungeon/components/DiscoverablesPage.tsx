import React from "react";
import { InnerPanel } from "components/ui/Panel";
import { Label } from "components/ui/Label";
import { SUNNYSIDE } from "assets/sunnyside";
import { PIXEL_SCALE } from "features/game/lib/constants";

// Importamos tus constantes de nivel para saber qué objetos hay
import { LEVEL_DESIGNS } from "../DeepDungeonConstants";

export const DiscoverablesPage: React.FC = () => {
  // Obtenemos la escena de Phaser para los datos en tiempo real
  const phaserScene = (
    window as Window & {
      phaserGame?: { scene: { keys: { DeepDungeonScene: any } } };
    }
  ).phaserGame?.scene.keys.DeepDungeonScene;
  const currentLevel = phaserScene?.currentLevel || 1;
  const levelData = LEVEL_DESIGNS[currentLevel];

  if (!levelData) return null;

  return (
    <InnerPanel className="flex flex-col h-full overflow-y-auto scrollable">
      <div className="p-2 space-y-4">
        {/* SECCIÓN DE HERRAMIENTAS (Picos) */}
        <div className="flex flex-col">
          <Label type="default" icon={SUNNYSIDE.icons.basket} className="mb-2">
            {"Tools & Equipment"}
          </Label>
          <div className="flex flex-wrap gap-2">
            <div
              className="relative bg-[#a3674d] border-2 border-[#754733] p-1 shadow-inner flex flex-col items-center justify-center"
              style={{
                width: `${PIXEL_SCALE * 24}px`,
                height: `${PIXEL_SCALE * 24}px`,
              }}
            >
              <img
                src="src/assets/icons/pickaxe.png"
                className="w-8 h-8 object-contain"
              />
              <div className="absolute -top-2 -right-2 bg-white border border-black px-1">
                <span className="text-[8px] font-pixel text-black">
                  {levelData.pickaxes -
                    (phaserScene?.items?.filter(
                      (it: any) => it.texture.key === "pickaxe",
                    ).length || 0)}
                  {`/`}
                  {levelData.pickaxes}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN DE CRISTALES */}
        <div className="flex flex-col">
          <Label
            type="formula"
            icon="/world/DeepDungeonAssets/bag_crystal.png"
            className="mb-2"
          >
            {"Minerals & Crystals"}
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {levelData.crystals.map((crystal, i) => {
              const inMap =
                phaserScene?.items?.filter(
                  (it: { type: string; crystalType: string }) =>
                    it.type === "crystal" && it.crystalType === crystal.type,
                ).length || 0;
              const found = crystal.count - inMap;

              return (
                <div
                  key={i}
                  className="flex items-center p-1 bg-[#d4a373] border-2 border-[#754733] relative"
                >
                  <img
                    src={`src/assets/icons/${crystal.type}_crystal_1.png`}
                    className="w-6 h-6 mr-2"
                  />
                  <div className="flex flex-col">
                    <span className="text-[8px] font-pixel uppercase truncate w-20">
                      {crystal.type}
                    </span>
                    <span className="text-[10px] font-pixel">
                      {found}
                      {`/`}
                      {crystal.count}
                    </span>
                  </div>
                  {found >= crystal.count && (
                    <img
                      src={SUNNYSIDE.icons.confirm}
                      className="absolute right-1 w-4"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </InnerPanel>
  );
};
