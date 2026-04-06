import React, { useContext, useEffect } from "react";
import { useSelector, useActor } from "@xstate/react";

// UI Components
import { Modal } from "components/ui/Modal";
import { Panel } from "components/ui/Panel";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { Loading } from "features/auth/components";

// Game Components
import { PortalContext } from "./lib/PortalProvider";
import { DeepDungeonHUD } from "./components/DeepDungeoHUD";
import { DeepDungeonPhaser } from "./DeepDungeonPhaser";
import { PortalMachineState } from "./lib/portalMachine";

// Utils
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { CONFIG } from "lib/config";
import { authorisePortal, claimPrize } from "../lib/portalUtil";
import { DeepDungeonRulesPanel } from "./components/panels/DeepDungeonRulesPanel";
import { DeepDungeonNoAttemptsPanel } from "./components/panels/DeepDungeonNoAttemptsPanel";

// --- SELECTORES DE ESTADO ---
const _sflBalance = (state: PortalMachineState) => state.context.state?.balance;
const _isError = (state: PortalMachineState) => state.matches("error");
const _isUnauthorised = (state: PortalMachineState) =>
  state.matches("unauthorised");
const _isLoading = (state: PortalMachineState) => state.matches("loading");
const _isNoAttempts = (state: PortalMachineState) =>
  state.matches("noAttempts");
const _isIntroduction = (state: PortalMachineState) =>
  state.matches("introduction");
const _isLoser = (state: PortalMachineState) => state.matches("loser");
const _isWinner = (state: PortalMachineState) => state.matches("winner");
const _isComplete = (state: PortalMachineState) => state.matches("complete");

export const DeepDungeon: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const [portalState] = useActor(portalService); // Necesario para portalState.context
  const { t } = useAppTranslation();

  const sflBalance = useSelector(portalService, _sflBalance);
  const isError = useSelector(portalService, _isError);
  const isUnauthorised = useSelector(portalService, _isUnauthorised);
  const isLoading = useSelector(portalService, _isLoading);
  const isNoAttempts = useSelector(portalService, _isNoAttempts);
  const isIntroduction = useSelector(portalService, _isIntroduction);
  const isWinner = useSelector(portalService, _isWinner);
  const isLoser = useSelector(portalService, _isLoser);
  const isComplete = useSelector(portalService, _isComplete);

  useEffect(() => {
    // Si el jugador intenta cerrar la pestaña mientras juega
    const handleBeforeUnload = () => {
      portalService.send("GAME_OVER");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [portalService]);

  if (isError) {
    return (
      <Modal show>
        <Panel>
          <div className="p-2">
            <Label type="danger">{t("error")}</Label>
            <span className="text-sm my-2">{t("error.wentWrong")}</span>
          </div>
          <Button onClick={() => portalService.send("RETRY")}>
            {t("retry")}
          </Button>
        </Panel>
      </Modal>
    );
  }

  if (isUnauthorised) {
    return (
      <Modal show>
        <Panel>
          <div className="p-2">
            <Label type="danger">{t("error")}</Label>
            <span className="text-sm my-2">{t("session.expired")}</span>
          </div>
          <Button onClick={authorisePortal}>{t("welcome.login")}</Button>
        </Panel>
      </Modal>
    );
  }

  if (isLoading) {
    return (
      <Modal show>
        <Panel>
          <Loading />
          <span className="text-xs">
            {`${t("last.updated")}:${CONFIG.CLIENT_VERSION}`}
          </span>
        </Panel>
      </Modal>
    );
  }

  return (
    <div>
      {isNoAttempts && (
        <Modal show>
          <DeepDungeonNoAttemptsPanel />
        </Modal>
      )}

      {isIntroduction && (
        <Modal show>
          <DeepDungeonRulesPanel
            mode={"introduction"}
            showScore={false}
            showExitButton={true}
            confirmButtonText={t("start")}
            onConfirm={() => portalService.send("CONTINUE")}
          />
        </Modal>
      )}

      {isLoser && (
        <Modal show>
          <DeepDungeonRulesPanel
            mode={"failed"}
            showScore={true}
            showExitButton={true}
            confirmButtonText={t("play.again")}
            onConfirm={() => portalService.send("RETRY")}
          />
        </Modal>
      )}

      {isWinner && (
        <Modal show>
          <DeepDungeonRulesPanel
            mode={"success"}
            showScore={true}
            showExitButton={false}
            confirmButtonText={t("claim")}
            onConfirm={claimPrize}
          />
        </Modal>
      )}

      {isComplete && (
        <Modal show>
          <DeepDungeonRulesPanel
            mode={"introduction"}
            showScore={true}
            showExitButton={true}
            confirmButtonText={t("play.again")}
            onConfirm={() => portalService.send("RETRY")}
          />
        </Modal>
      )}

      {/* JUEGO PRINCIPAL */}
      {sflBalance && (
        <>
          <DeepDungeonHUD />
          <DeepDungeonPhaser />
        </>
      )}
    </div>
  );
};
