import React, { useState, useContext } from "react";
import { useSelector } from "@xstate/react";
import { useActor } from "@xstate/react";
import { PortalContext } from "../lib/PortalProvider";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { SUNNYSIDE } from "assets/sunnyside";
import { goHome } from "../../lib/portalUtil";

// Componentes de UI originales
import { HudContainer } from "components/ui/HudContainer";
import { EnergyStats } from "./EnergyBar"; // Tu barra de vida/energía
import { ExhaustedAlert } from "./ExhaustedAlert";

// Componentes del Codex
import { Modal } from "components/ui/Modal";
import { OuterPanel } from "components/ui/Panel";
import { SquareIcon } from "components/ui/SquareIcon";
import { DungeonProgress } from "../components/DungeonProgress";
import { DungeonDrops } from "../components/DungeonDrops";
import codexIcon from "assets/icons/codex.webp";
import chores from "assets/icons/chores.webp";
import { DungeonInventory } from "../components/DungeonInventory";
import { ITEM_DETAILS } from "features/game/types/images";
import { CardSelectionHUD } from "./CardSelectionHUD";
import Decimal from "decimal.js-light";
import { Box } from "components/ui/Box";
import pickaxeIcon from "./assets/pickaxe.png";
import { PortalMachineState } from "../lib/portalMachine";
import { DeepDungeonGuide } from "./panels/DeepDungeonGuide";
// Registramos las 20 variantes (4 colores x 5 formas)
const colors = ["rosa", "blanco", "azul", "mixto"];
colors.forEach((color) => {
  for (let i = 1; i <= 5; i++) {
    const key = `mena_${color}_${i}`;
    (ITEM_DETAILS as any)[key] = {
      description: `Cristal ${color} forma ${i}`,
      image: `world/DeepDungeonAssets/${key}.png`, // Ruta a tus assets
    };
  }
});
const _isPlaying = (state: PortalMachineState) => state.matches("playing");

export const DeepDungeonHUD: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const [portalState] = useActor(portalService);
  const [showInventory, setShowInventory] = useState(false);
  const [showCodex, setShowCodex] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "Enemies" | "Crystals" | "Drops" | "Guide"
  >("Enemies");
  const isPlaying = useSelector(portalService, _isPlaying);

  // Extraemos stats para los picos
  const { dungeonPoints, score, stats } = portalState.context;

  return (
    <HudContainer>
      {/* 1. BARRA DE VIDA / ENERGÍA */}
      {isPlaying && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ top: `${PIXEL_SCALE * 6}px`, left: `${PIXEL_SCALE * 6}px` }}
        >
          <div className="pointer-events-auto">
            <EnergyStats />
          </div>
        </div>
      )}

      {/* SISTEMA DE CARTAS */}
      {isPlaying && portalState.context.showCardSelector && (
        <CardSelectionHUD />
      )}

      {isPlaying && <ExhaustedAlert />}

      {/* --- SECCIÓN SUPERIOR DERECHA (HUD DE BOTONES) --- */}
      {isPlaying && (
        <div
          className="fixed z-50 flex flex-col items-end gap-2"
          style={{ right: `${PIXEL_SCALE * 3}px`, top: `${PIXEL_SCALE * 3}px` }}
        >
          {/* BOTÓN CÓDICE */}
          <div
            className="pointer-events-auto cursor-pointer hover:img-highlight group relative"
            style={{
              width: `${PIXEL_SCALE * 22}px`,
              height: `${PIXEL_SCALE * 23}px`,
            }}
            onClick={() => setShowCodex(true)}
          >
            <img
              src={SUNNYSIDE.ui.round_button}
              className="w-full group-active:translate-y-[2px]"
            />
            <img
              src={codexIcon}
              className="absolute w-[60%] top-[15%] left-[20%]"
            />
          </div>

          {/* BOTÓN CESTA (INVENTARIO) */}
          <div
            className="pointer-events-auto cursor-pointer hover:img-highlight group relative"
            style={{
              width: `${PIXEL_SCALE * 22}px`,
              height: `${PIXEL_SCALE * 23}px`,
            }}
            onClick={() => setShowInventory(true)}
          >
            <img
              src={SUNNYSIDE.ui.round_button}
              className="w-full group-active:translate-y-[2px]"
            />
            <img
              src={SUNNYSIDE.icons.basket}
              className="absolute w-[60%] top-[15%] left-[20%]"
            />
          </div>

          {/* CONTADOR DE PICOS */}
          <div className="pointer-events-auto">
            <Box
              image={pickaxeIcon}
              count={new Decimal(stats.inventory.pickaxe || 0)}
              disabled={!stats.inventory.pickaxe}
            />
          </div>
        </div>
      )}

      {/* MODAL DE INVENTARIO */}
      <Modal
        show={showInventory}
        onHide={() => setShowInventory(false)}
        dialogClassName="md:max-w-4xl"
      >
        <OuterPanel className="flex flex-col h-[500px] w-full p-1">
          <div className="flex items-center pl-1 mb-2">
            <div className="flex items-center grow">
              <img src={SUNNYSIDE.icons.basket} className="h-6 mr-3 ml-1" />
              <p className="font-pixel text-sm uppercase text-brown-800">{`Dungeon Inventory`}</p>
            </div>
            <img
              src={SUNNYSIDE.icons.close}
              className="cursor-pointer"
              onClick={() => setShowInventory(false)}
              style={{ width: `${PIXEL_SCALE * 11}px` }}
            />
          </div>
          <OuterPanel className="flex-1 bg-[#e4a672] border-2 border-[#754733] rounded-sm overflow-y-auto p-2">
            <DungeonInventory portalService={portalService} />
          </OuterPanel>
        </OuterPanel>
      </Modal>

      {/* BOTÓN IR A CASA (ABAJO IZQUIERDA) */}
      {isPlaying && (
        <div
          className="fixed z-50 flex justify-between w-full px-4"
          style={{ bottom: `${PIXEL_SCALE * 3}px`, pointerEvents: "none" }}
        >
          <div
            className="pointer-events-auto cursor-pointer hover:img-highlight group relative"
            style={{
              width: `${PIXEL_SCALE * 22}px`,
              height: `${PIXEL_SCALE * 23}px`,
            }}
            onClick={() => goHome()}
          >
            <img
              src={SUNNYSIDE.ui.round_button}
              className="w-full group-active:translate-y-[2px]"
            />
            <img
              src={SUNNYSIDE.icons.worldIcon}
              className="absolute w-[60%] top-[15%] left-[20%]"
            />
          </div>
        </div>
      )}

      {/* MODAL DEL CODEX */}
      <Modal
        show={showCodex}
        onHide={() => setShowCodex(false)}
        dialogClassName="md:max-w-4xl"
      >
        <OuterPanel className="flex flex-col h-[500px] w-full p-1">
          {/* ... Contenido del Codex ... */}
          <div className="flex items-center pl-1 mb-2">
            <div className="flex items-center grow">
              <img src={SUNNYSIDE.icons.search} className="h-6 mr-3 ml-1" />
              <p className="font-pixel text-sm uppercase text-brown-800">{`Dungeon Codex`}</p>
            </div>
            <img
              src={SUNNYSIDE.icons.close}
              className="cursor-pointer"
              onClick={() => setShowCodex(false)}
              style={{ width: `${PIXEL_SCALE * 11}px` }}
            />
          </div>
          <div className="flex flex-row h-full overflow-hidden">
            <div className="flex flex-col gap-1 pr-1 ml-0.5">
              <OuterPanel
                className="p-1 cursor-pointer"
                onClick={() => setActiveTab("Enemies")}
                style={{
                  background: activeTab === "Enemies" ? "#ead4aa" : undefined,
                }}
              >
                <SquareIcon icon={SUNNYSIDE.icons.death} width={9} />
              </OuterPanel>
              <OuterPanel
                className="p-1 cursor-pointer"
                onClick={() => setActiveTab("Crystals")}
                style={{
                  background: activeTab === "Crystals" ? "#ead4aa" : undefined,
                }}
              >
                <SquareIcon icon={SUNNYSIDE.icons.hammer} width={9} />
              </OuterPanel>
              <OuterPanel
                className="p-1 cursor-pointer"
                onClick={() => setActiveTab("Drops")}
                style={{
                  background: activeTab === "Drops" ? "#ead4aa" : undefined,
                }}
              >
                <SquareIcon
                  icon={SUNNYSIDE.icons.expression_confused}
                  width={9}
                />
              </OuterPanel>
              <OuterPanel
                className="p-1 cursor-pointer"
                onClick={() => setActiveTab("Guide")}
                style={{
                  background: activeTab === "Guide" ? "#ead4aa" : undefined,
                }}
              >
                <SquareIcon icon={chores} width={9} />
              </OuterPanel>
            </div>
            <div className="flex-1 overflow-y-auto flex flex-col rounded-md p-1 ml-1">
              {activeTab === "Enemies" && (
                <DungeonProgress category="Enemies" />
              )}
              {activeTab === "Crystals" && (
                <DungeonProgress category="Crystals" />
              )}
              {activeTab === "Drops" && <DungeonDrops />}
            </div>
            {activeTab === "Guide" && <DeepDungeonGuide />}
          </div>
        </OuterPanel>
      </Modal>
    </HudContainer>
  );
};
