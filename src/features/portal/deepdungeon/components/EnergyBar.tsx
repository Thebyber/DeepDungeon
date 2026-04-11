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
const bagCrystalIcon = "/world/DeepDungeonAssets/bag_crystal.png";

// Estas funciones garantizan que React detecte el cambio de número
const selectEnergy = (state: PortalMachineState) => state.context.stats.energy;
const selectMaxEnergy = (state: PortalMachineState) =>
  state.context.stats.maxEnergy;
const selectScore = (state: PortalMachineState) => state.context.score;
const selectStats = (state: PortalMachineState) => state.context.stats;
const selectLevel = (state: PortalMachineState) =>
  state.context.stats.currentLevel;
const selectCodex = (state: PortalMachineState) => state.context.codex;

export const EnergyStats: React.FC = () => {
  const { portalService } = useContext(PortalContext);

  const energy = useSelector(portalService, selectEnergy);
  const maxEnergy = useSelector(portalService, selectMaxEnergy);
  const score = useSelector(portalService, selectScore);
  const stats = useSelector(portalService, selectStats);
  const level = useSelector(portalService, selectLevel);
  const codex = useSelector(portalService, selectCodex);

  const { attack, defense, criticalChance } = stats;
  const percentage = Math.max(0, Math.min(100, (energy / maxEnergy) * 100));

  const totalEnemiesKilled = Object.values(codex.enemiesDefeated).reduce(
    (sum, n) => sum + n,
    0,
  );
  const totalCrystalsMined = Object.values(codex.crystalsMined).reduce(
    (sum, n) => sum + n,
    0,
  );

  let barColor = "#22c55e";
  if (percentage <= 20) barColor = "#ef4444";
  else if (percentage <= 50) barColor = "#facc15";

  return (
    <div className="flex flex-col items-start">
      <InnerPanel
        className="flex flex-col p-2"
        style={{ width: `${PIXEL_SCALE * 90}px` }}
      >
        {/* ENERGY BAR */}
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

        {/* COMBAT STATS */}
        <div className="flex justify-between items-center mt-1 px-1">
          <StatItem value={attack} icon={swordIcon} />
          <StatItem value={defense} icon={shieldIcon} />
          <StatItem
            value={`${Math.round(criticalChance * 100)}%`}
            icon={critIcon}
          />
        </div>

        {/* STATISTICS LABEL */}
        <div
          className="mt-1"
          style={{ borderTop: "2px solid rgba(255,255,255,0.4)" }}
        />

        {/* MAP + KILLS + CRYSTALS */}
        <div className="flex justify-between items-center mt-1 px-1">
          <StatItem value={`${level}`} icon={SUNNYSIDE.icons.worldIcon} />
          <StatItem
            value={totalEnemiesKilled}
            icon="/world/DeepDungeonAssets/skull.png"
          />
          <StatItem value={totalCrystalsMined} icon={bagCrystalIcon} />
        </div>

        {/* SCORE */}
        <div
          className="flex items-center justify-between mt-1 pt-1 px-1"
          style={{ borderTop: "2px solid rgba(255,255,255,0.4)" }}
        >
          <span
            className="font-pixel text-white"
            style={{ fontSize: `${PIXEL_SCALE * 10}px` }}
          >
            {"Score"}
          </span>
          <span
            className="font-pixel text-white"
            style={{ fontSize: `${PIXEL_SCALE * 10}px` }}
          >
            {score}
          </span>
        </div>
      </InnerPanel>
    </div>
  );
};

const StatItem = ({
  value,
  icon,
}: {
  value: number | string;
  icon: string;
}) => (
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
