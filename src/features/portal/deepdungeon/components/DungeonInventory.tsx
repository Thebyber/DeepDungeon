import React from "react";
import { useActor } from "@xstate/react";
import { Box } from "components/ui/Box";
import { MachineInterpreter } from "../lib/portalMachine";
import { Label } from "components/ui/Label";
import { SUNNYSIDE } from "assets/sunnyside";
import { ITEM_DETAILS } from "features/game/types/images";
import pickaxeImg from "./assets/pickaxe.png";

interface Props {
  portalService: MachineInterpreter;
}

export const DungeonInventory: React.FC<Props> = ({ portalService }) => {
  const [portalState] = useActor(portalService);
  const inventory = portalState.context.stats.inventory || {};

  // Filtros
  const tools = Object.keys(inventory).filter(
    (key) => key === "pickaxe" && inventory[key] > 0,
  );

  const crystals = Object.keys(inventory).filter(
    (key) => key.startsWith("mena_") && inventory[key] > 0,
  );

  // Si está vacío, mostramos un mensaje amigable dentro del modal
  if (tools.length === 0 && crystals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full opacity-70">
        <img src={SUNNYSIDE.icons.basket} className="w-10 mb-2" />
        <p className="font-pixel text-xs text-brown-800">{`Your basket is empty`}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      {/* SECCIÓN TOOLS */}
      {tools.length > 0 && (
        <section>
          <div className="mb-3">
            <Label
              type="formula"
              icon={SUNNYSIDE.icons.hammer}
              className="ml-1"
            >
              {"Tools"}
            </Label>
          </div>
          <div className="flex flex-wrap gap-2">
            {tools.map((name) => (
              <Box
                key={name}
                image={
                  name === "pickaxe"
                    ? pickaxeImg
                    : ITEM_DETAILS[name as any]?.image
                }
                count={inventory[name]}
              />
            ))}
          </div>
        </section>
      )}

      {/* SECCIÓN CRYSTALS */}
      {crystals.length > 0 && (
        <section>
          <div className="mb-3">
            <Label
              type="formula"
              icon={SUNNYSIDE.icons.search}
              className="ml-1"
            >
              {"Crystals"}
            </Label>
          </div>
          <div className="flex flex-wrap gap-2">
            {crystals.map((name) => (
              <Box
                key={name}
                image={`world/DeepDungeonAssets/${name}.png`}
                count={inventory[name]}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
