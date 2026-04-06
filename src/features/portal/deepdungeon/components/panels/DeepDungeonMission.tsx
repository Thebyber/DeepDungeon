import React, { useContext, useState } from "react";

import { Button } from "components/ui/Button";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";
import { Label } from "components/ui/Label";
import { DeepDungeonMissionPrize } from "./DeepDungeonMissionPrize";
import { DeepDungeonAttempts } from "./DeepDungeonAttempts";
import { getAttemptsLeft } from "../../lib/DeepDungeonUtils";
import { goHome } from "features/portal/lib/portalUtil";
import { PortalMachineState } from "../../lib/portalMachine";
import { SUNNYSIDE } from "assets/sunnyside";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { SquareIcon } from "components/ui/SquareIcon";
import key from "public/world/DeepDungeonAssets/key.png";
import { Controls } from "./DeepDungeonControls";

interface Props {
  mode: "introduction" | "success" | "failed";
  showScore: boolean;
  showExitButton: boolean;
  confirmButtonText: string;
  onConfirm: () => void;
}

const _minigame = (state: PortalMachineState) =>
  state.context.state?.minigames.games["deep-dungeon"];
const _lastScore = (state: PortalMachineState) => state.context.lastScore;
const getDateKey = () => new Date().toISOString().slice(0, 10);

export const DeepDungeonMission: React.FC<Props> = ({
  mode,
  showScore,
  showExitButton,
  confirmButtonText,
  onConfirm,
}) => {
  const { t } = useAppTranslation();

  const { portalService } = useContext(PortalContext);

  const minigame = useSelector(portalService, _minigame);
  const attemptsLeft = getAttemptsLeft(minigame);
  const lastScore = useSelector(portalService, _lastScore);

  const dateKey = getDateKey();

  const [currentPage, setCurrentPage] = useState<"main" | "controls">("main");

  return (
    <>
      {currentPage === "main" && (
        <>
          <div>
            <div className="w-full relative flex justify-between gap-1 items-center mb-1 py-1 pl-2">
              {mode === "introduction" && (
                <Label type="default" icon={SUNNYSIDE.icons.plant}>
                  {t("deepdungeon.portal.title")}
                </Label>
              )}
              {mode === "success" && (
                <Label type="success" icon={SUNNYSIDE.icons.confirm}>
                  {t("deepdungeon.missionSuccess")}
                </Label>
              )}
              {mode === "failed" && (
                <Label type="danger" icon={SUNNYSIDE.icons.death}>
                  {t("deepdungeon.missionFailed")}
                </Label>
              )}
              <DeepDungeonAttempts attemptsLeft={attemptsLeft} />
            </div>

            <div
              className="flex flex-row"
              style={{
                marginBottom: `${PIXEL_SCALE * 1}px`,
              }}
            >
              <div className="flex justify-between flex-col space-y-1 px-1 mb-3 text-sm flex-grow">
                {showScore && (
                  <span>
                    {t("deepdungeon.score", {
                      score: Math.round(lastScore),
                    })}
                  </span>
                )}
                <span>
                  {t("deepdungeon.bestToday", {
                    score: minigame?.history[dateKey]?.highscore
                      ? Math.round(minigame?.history[dateKey]?.highscore)
                      : 0,
                  })}
                </span>
                <span>
                  {t("deepdungeon.bestAllTime", {
                    score: Object.values(minigame?.history ?? {}).reduce(
                      (acc, { highscore }) =>
                        Math.round(Math.max(acc, highscore)),
                      0,
                    ),
                  })}
                </span>
              </div>
              <div className="flex items-center mt-1">
                <Button
                  className="whitespace-nowrap capitalize"
                  onClick={() => {
                    setCurrentPage("controls");
                  }}
                >
                  <div className="flex flex-row items-center gap-1">
                    <SquareIcon icon={key} width={8} />
                    {t(`deepdungeon.controls`)}
                  </div>
                </Button>
              </div>
            </div>

            <DeepDungeonMissionPrize />
          </div>

          <div className="flex mt-1 space-x-1">
            {showExitButton && (
              <Button className="whitespace-nowrap capitalize" onClick={goHome}>
                {t("exit")}
              </Button>
            )}
            <Button
              className="whitespace-nowrap capitalize"
              onClick={onConfirm}
            >
              {confirmButtonText}
            </Button>
          </div>
        </>
      )}
      {currentPage === "controls" && (
        <Controls onBack={() => setCurrentPage("main")} />
      )}
    </>
  );
};
