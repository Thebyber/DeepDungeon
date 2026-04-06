import React, { useContext } from "react";
import { useSelector } from "@xstate/react";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { SUNNYSIDE } from "assets/sunnyside";
import { PortalContext } from "../lib/PortalProvider"; // Asegúrate de esta ruta
import { ResizableBar } from "components/ui/ProgressBar";
import { InnerPanel } from "components/ui/Panel";
import { PortalMachineState } from "../lib/portalMachine"; // Asegúrate de esta ruta

import shieldIcon from "./assets/shield.png";
import swordIcon from "./assets/sword.png";
import critIcon from "./assets/crit.png";

const _energy = (state: PortalMachineState) => state.context.stats.energy;

// Estas funciones garantizan que React detecte el cambio de número
const selectEnergy = (state: PortalMachineState) => state.context.stats.energy;
const selectMaxEnergy = (state: PortalMachineState) =>
  state.context.stats.maxEnergy;
const selectScore = (state: PortalMachineState) => state.context.score;
const selectStats = (state: PortalMachineState) => state.context.stats;

export const EnergyStats: React.FC = () => {
  const { portalService } = useContext(PortalContext);

  // --- 2. SUSCRIPCIÓN ESPECÍFICA ---
  // useSelector hace que este componente se "despierte" solo cuando estos valores cambian
  const energy = useSelector(portalService, selectEnergy);
  const maxEnergy = useSelector(portalService, selectMaxEnergy);
  const score = useSelector(portalService, selectScore);
  const stats = useSelector(portalService, selectStats);

  const { attack, defense, criticalChance } = stats;
  const percentage = Math.max(0, Math.min(100, (energy / maxEnergy) * 100));

  // Lógica de color reactiva
  let barColor = "#22c55e";
  if (percentage <= 20) barColor = "#ef4444";
  else if (percentage <= 50) barColor = "#facc15";

  return (
    <div className="flex flex-col items-start">
      {/* TARGET SCORE */}
      <div
        className="w-fit justify-center flex items-center text-xs relative"
        style={{
          borderImage:
            "url('https://sunflower-land.com/game-assets/ui/panel/vibrant_border.png') 20% / 1 / 0 stretch",
          borderStyle: "solid",
          borderWidth: `${PIXEL_SCALE * 1.5}px`,
          imageRendering: "pixelated",
          borderRadius: `${PIXEL_SCALE * 3.5}px`,
          background: "#b65389",
          paddingLeft: `${PIXEL_SCALE * 5}px`,
          paddingRight: `${PIXEL_SCALE * 1}px`,
          color: "white",
          height: `${PIXEL_SCALE * 10}px`,
          marginBottom: `${PIXEL_SCALE * 2}px`,
          marginLeft: `${PIXEL_SCALE * 2}px`,
        }}
      >
        <div
          className="flex justify-center items-center absolute top-1/2 -translate-y-1/2"
          style={{
            width: `${PIXEL_SCALE * 10}px`,
            height: `${PIXEL_SCALE * 10}px`,
            left: `-${PIXEL_SCALE * 5}px`,
          }}
        >
          <img
            src="https://sunflower-land.com/game-assets/resources/treasures/pirate_bounty.webp"
            style={{ width: `${PIXEL_SCALE * 10}px` }}
          />
        </div>
        <span className="font-pixel ml-1">{score}</span>
      </div>

      <InnerPanel
        className="flex flex-col p-2"
        style={{ width: `${PIXEL_SCALE * 90}px` }}
      >
        <div className="flex items-center gap-2">
          <img
            src={SUNNYSIDE.icons.lightning}
            style={{ width: `${PIXEL_SCALE * 10}px` }}
            alt="Energy"
          />
          <div className="relative flex-grow flex items-center justify-center">
            <div className="w-full custom-energy-bar">
              <ResizableBar
                percentage={percentage}
                type="progress"
                outerDimensions={{ width: 70, height: 12 }}
              />
            </div>
            {/* Sincronizamos el color de la barra con el estado de React */}
            <style>{`.custom-energy-bar [role="progressbar"] > div { background-color: ${barColor} !important; transition: width 0.3s ease; }`}</style>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span
                className="text-white font-pixel shadow-text"
                style={{ fontSize: `${PIXEL_SCALE * 10}px` }}
              >
                {`${Math.floor(energy)}/${maxEnergy}`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-1 px-1">
          <StatItem value={attack} icon={swordIcon} />
          <StatItem value={defense} icon={shieldIcon} />
          <StatItem
            value={Math.round(criticalChance * 100) + "%"}
            icon={critIcon}
          />
        </div>
      </InnerPanel>
    </div>
  );
};

const StatItem = ({ value, icon }: { value: number; icon: string }) => (
  <div className="flex items-center gap-1">
    <span
      className="text-white font-pixel"
      style={{ fontSize: `${PIXEL_SCALE * 12}px` }}
    >
      {value}
    </span>
    <img src={icon} style={{ width: `${PIXEL_SCALE * 10}px` }} />
  </div>
);
