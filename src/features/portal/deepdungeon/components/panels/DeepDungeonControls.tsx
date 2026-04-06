import React from "react";

import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { SUNNYSIDE } from "assets/sunnyside";
import { Label } from "components/ui/Label";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { useSound } from "lib/utils/hooks/useSound";
import { OuterPanel } from "components/ui/Panel";
import { isTouchDevice } from "features/world/lib/device";

import moveControls1 from "public/world/DeepDungeonAssets/move_controls_1.png";
import moveControls2 from "public/world/DeepDungeonAssets/move_controls_2.png";
import joystick from "public/world/DeepDungeonAssets/joystick.png";

export const JOYSTICK_LOCAL_STORAGE_KEY = "settings.controls.joystickEnabled";
const PORTAL_NAME = "deepdungeon";

type Props = {
  onBack: () => void;
};

export const Controls: React.FC<Props> = ({ onBack }) => {
  const { t } = useAppTranslation();

  const button = useSound("button");

  return (
    <div className="flex flex-col gap-1 max-h-[75vh]">
      {/* title */}
      <div className="flex flex-col gap-1">
        <div className="flex text-center">
          <div
            className="flex-none"
            style={{
              width: `${PIXEL_SCALE * 11}px`,
              marginLeft: `${PIXEL_SCALE * 2}px`,
            }}
          >
            <img
              src={SUNNYSIDE.icons.arrow_left}
              className="cursor-pointer"
              onClick={() => {
                button.play();
                onBack();
              }}
              style={{
                width: `${PIXEL_SCALE * 11}px`,
              }}
            />
          </div>
          <div className="grow mb-3 text-lg">
            {t(`${PORTAL_NAME}.controls`)}
          </div>
          <div className="flex-none">
            <div
              style={{
                width: `${PIXEL_SCALE * 11}px`,
                marginRight: `${PIXEL_SCALE * 2}px`,
              }}
            />
          </div>
        </div>
      </div>

      {/* content */}
      <div className="flex flex-col gap-1 overflow-y-auto scrollable pr-1">
        <div className="w-full flex flex-row gap-1 mb-3">
          <OuterPanel className="w-full flex flex-col items-center gap-2">
            <Label type="info">{t(`${PORTAL_NAME}.controls.move`)}</Label>
            <div className="h-100 flex-1 flex flex-col items-center justify-center">
              {isTouchDevice() ? (
                <img src={joystick} className="h-20 my-3" />
              ) : (
                <>
                  <img src={moveControls1} className="h-20" />
                  <img src={moveControls2} className="h-20" />
                </>
              )}
            </div>
            <Label type="warning">
              {t(`deepdungeon.controls.moveDescription`)}
            </Label>
          </OuterPanel>
        </div>
      </div>
    </div>
  );
};
