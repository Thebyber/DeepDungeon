import React, { useState } from "react";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { CloseButtonPanel } from "features/game/components/CloseablePanel";
import { DeepDungeonMission } from "./DeepDungeonMission";
import { DEEPDUNGEON_NPC_WEARABLES } from "../../DeepDungeonConstants";
import { DeepDungeonGuide } from "./DeepDungeonGuide";
import { DeepDungeonDonations } from "./DeepDungeonDonations";
import chores from "assets/icons/chores.webp";
import { SUNNYSIDE } from "assets/sunnyside";

interface Props {
  mode: "introduction" | "success" | "failed";
  showScore: boolean;
  showExitButton: boolean;
  confirmButtonText: string;
  onConfirm: () => void;
}
export const DeepDungeonRulesPanel: React.FC<Props> = ({
  mode,
  showScore,
  showExitButton,
  confirmButtonText,
  onConfirm,
}) => {
  const { t } = useAppTranslation();

  const [tab, setTab] = useState<"main" | "guide" | "donations">("main");

  return (
    <CloseButtonPanel
      className="overflow-y-hidden"
      bumpkinParts={DEEPDUNGEON_NPC_WEARABLES}
      currentTab={tab}
      setCurrentTab={setTab}
      onClose={onConfirm}
      tabs={[
        {
          icon: SUNNYSIDE.icons.plant,
          name: t("deepdungeon.mission"),
          id: "main",
        },
        {
          icon: chores,
          name: t("deepdungeon.guide"),
          id: "guide",
        },
        {
          icon: SUNNYSIDE.icons.heart,
          name: t("deepdungeon.donations"),
          id: "donations",
        },
      ]}
    >
      <>
        {tab === "main" && (
          <DeepDungeonMission
            mode={mode}
            showScore={showScore}
            showExitButton={showExitButton}
            confirmButtonText={confirmButtonText}
            onConfirm={onConfirm}
          />
        )}
        {tab === "guide" && <DeepDungeonGuide />}
        {tab === "donations" && <DeepDungeonDonations />}
      </>
    </CloseButtonPanel>
  );
};
