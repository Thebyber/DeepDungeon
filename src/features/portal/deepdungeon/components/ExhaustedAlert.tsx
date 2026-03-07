import React, { useContext } from "react";
import { useActor } from "@xstate/react";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { SUNNYSIDE } from "assets/sunnyside";
import { InnerPanel } from "components/ui/Panel";
// Importamos el contexto de la máquina que creamos antes
import { PortalContext } from "../lib/PortalProvider";

export const ExhaustedAlert: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const [state] = useActor(portalService);

  // --- EL CAMBIO CLAVE ---
  // Ya no escuchamos eventos manuales.
  // Si la máquina cambió al estado "gameOver", el componente se renderiza.
  const isGameOver = state.matches("gameOver");

  if (!isGameOver) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-auto animate-fades-in"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }} // Oscurecemos un poco más para énfasis
    >
      <InnerPanel className="flex flex-col items-center p-4">
        <img
          src={SUNNYSIDE.icons.death}
          style={{
            width: `${PIXEL_SCALE * 22}px`,
            marginBottom: `${PIXEL_SCALE * 4}px`,
          }}
          alt="Exhausted"
        />
        <h2
          className="text-white font-pixel shadow-text text-center uppercase"
          style={{ fontSize: `${PIXEL_SCALE * 12}px`, color: "#ef4444" }}
        >
          {`¡Te has quedado sin energía!`}
        </h2>

        {/* Ahora podemos añadir botones de acción fácilmente */}
        <button
          className="mt-4 bg-red-500 p-2 font-pixel text-white uppercase"
          onClick={() => portalService.send("RETRY")}
          style={{ fontSize: `${PIXEL_SCALE * 8}px` }}
        >
          {`Reintentar`}
        </button>
      </InnerPanel>
    </div>
  );
};
