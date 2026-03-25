import React, { useContext } from "react";
import { useActor } from "@xstate/react";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { SUNNYSIDE } from "assets/sunnyside";
import { PortalContext } from "../lib/PortalProvider"; // Asegúrate de esta ruta
import { ResizableBar } from "components/ui/ProgressBar";
import { InnerPanel } from "components/ui/Panel";

import shieldIcon from "./assets/shield.png";
import swordIcon from "./assets/sword.png";
import critIcon from "./assets/crit.png";

export const EnergyStats: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const [portalState] = useActor(portalService);

  // Extraemos todo de la máquina
  const { stats } = portalState.context;
  const { energy, maxEnergy, attack, defense, targetScore, criticalChance } =
    stats;
  const pickaxes = stats.inventory.pickaxe;

  const percentage = Math.max(0, Math.min(100, (energy / maxEnergy) * 100));

  let barColor = "#22c55e";
  if (percentage <= 20) barColor = "#ef4444";
  else if (percentage <= 50) barColor = "#facc15";

  return (
    <div className="flex flex-col items-start">
      {/* 1. TARGET SCORE */}
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
        <span className="font-pixel ml-1">{targetScore}</span>
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
            <style>{`.custom-energy-bar [role="progressbar"] > div { background-color: ${barColor} !important; }`}</style>
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
          <StatItem value={Math.round(criticalChance * 100)} icon={critIcon} />

          {/* <StatItem icon={pickaxeIcon} value={pickaxes} /> */}
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
