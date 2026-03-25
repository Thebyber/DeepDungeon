import React, { useContext } from "react"; // 1. Añadimos useContext
import { PIXEL_SCALE } from "features/game/lib/constants";
import { SUNNYSIDE } from "assets/sunnyside";
import { Label } from "components/ui/Label";
// 2. Importamos el contexto de la máquina (ajusta la ruta si es necesario)
import { PortalContext } from "../lib/PortalProvider";
import { useActor } from "@xstate/react";

export const DeepDungeonTarget: React.FC = () => {
  // 3. Obtenemos el servicio de la máquina desde el contexto
  const { portalService } = useContext(PortalContext);
  const [state] = useActor(portalService);

  // 4. Leemos el targetScore directamente del contexto de la máquina
  const targetScore = state.context.stats.targetScore;

  return (
    <Label
      icon={SUNNYSIDE.resource.pirate_bounty}
      style={{
        width: "fit-content",
        minWidth: `${PIXEL_SCALE * 20}px`,
      }}
      type="default"
    >
      <span className="font-pixel ml-1">{targetScore}</span>
    </Label>
  );
};
