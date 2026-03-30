import React, { useContext, useEffect, useState } from "react";
import { useSelector } from "@xstate/react";

// UI Components
import { SUNNYSIDE } from "assets/sunnyside";
import { OuterPanel } from "components/ui/Panel";
import { Label } from "components/ui/Label";

// Utils & Assets
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { secondsToString } from "lib/utils/time";
import mark from "assets/icons/faction_mark.webp"; // Puedes cambiarlo por coins si prefieres

// Context & Machine
import { PortalContext } from "../../lib/PortalProvider";
import { PortalMachineState } from "../../lib/portalMachine";

// --- SELECTORS ---

// Obtiene el Highscore del día actual
const todayHighscoreSel = (state: PortalMachineState) => {
  const currDate = new Date().toISOString().split("T")[0];
  const minigame = state.context.state?.minigames.games["deep-dungeon"];
  const minigameHistory = minigame?.history ?? {};

  return minigameHistory[currDate]?.highscore ?? 0;
};

// Obtiene el objeto del premio directamente
const minigamePrizeSel = (state: PortalMachineState) => {
  return state.context.state?.minigames.prizes["deep-dungeon"];
};
const getSecondsLeft = (endAt: number) => {
  const diff = endAt - Date.now();
  return Math.max(0, diff / 1000);
};
export const DeepDungeonMissionPrize: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const { t } = useAppTranslation();

  // Escuchamos el premio y el highscore
  const prize = useSelector(portalService, minigamePrizeSel);
  const todayHighscore = useSelector(portalService, todayHighscoreSel);

  // Usamos un estado simple para forzar el re-render cada segundo
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Si no hay premio configurado en el servidor/landData, mostramos panel vacío
  if (!prize) {
    return (
      <OuterPanel>
        <div className="px-1">
          <Label type="danger" icon={SUNNYSIDE.icons.sad}>
            {t("deepdungeon.noPrizeAvailable")}
          </Label>
        </div>
      </OuterPanel>
    );
  }

  // --- LÓGICA DE VICTORIA BASADA EN PRIZE.SCORE ---
  const missionComplete = todayHighscore >= prize.score;
  const secondsLeft = getSecondsLeft(prize.endAt);

  return (
    <OuterPanel>
      <div className="px-1">
        {/* Objetivo dinámico basado en prize.score */}
        <span className="text-xs mb-2">
          {t("deepdungeon.missionObjective", {
            targetScore: prize.score,
          })}
        </span>

        <div className="flex justify-between mt-2 flex-wrap">
          {missionComplete ? (
            <Label type="success" icon={SUNNYSIDE.icons.confirm}>
              {t("deepdungeon.completed")}
            </Label>
          ) : (
            <Label type="info" icon={SUNNYSIDE.icons.stopwatch}>
              {secondsToString(secondsLeft, { length: "medium" })}
            </Label>
          )}

          {/* Recompensa (Items) */}
          <div className="flex items-center space-x-2">
            {!!prize.items?.Mark && (
              <Label icon={mark} type="warning">
                {prize.items?.Mark + " x Mark"}
              </Label>
            )}
          </div>
        </div>
      </div>
    </OuterPanel>
  );
};
