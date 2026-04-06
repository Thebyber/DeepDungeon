import React from "react";

import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { SquareIcon } from "components/ui/SquareIcon";
import { Label } from "components/ui/Label";
import { INSTRUCTIONS, POINTS } from "../../DeepDungeonConstants";
import { useSound } from "lib/utils/hooks/useSound";

type Props = {
  onBack?: () => void;
};

export const DeepDungeonGuide: React.FC<Props> = ({ onBack }) => {
  const { t } = useAppTranslation();

  const button = useSound("button");

  return (
    <div className="flex flex-col gap-1 max-h-[75vh]">
      {/* title */}
      <div className="flex flex-col gap-1">
        <div className="flex text-center">
          <div className="grow mb-3 text-lg">{t(`deepdungeon.guide`)}</div>
        </div>
      </div>

      {/* content */}
      <div className="flex flex-col gap-1 overflow-y-auto scrollable pr-1">
        {/* Instructions */}
        <Label type="default">{t(`deepdungeon.instructions`)}</Label>
        {INSTRUCTIONS.map(({ image, description, width = 10 }, index) => (
          <div key={index}>
            <div className="flex items-center mb-3 mx-2">
              <SquareIcon icon={image} width={width} />
              <p className="text-xs ml-3 flex-1">
                {t(`deepdungeon.guideDescription`, {
                  description: description,
                })}
              </p>
            </div>
          </div>
        ))}
        {/* Points */}
        <Label type="default">{t(`deepdungeon.points`)}</Label>
        {POINTS.map(({ image, description, width = 10 }, index) => (
          <div key={index}>
            <div className="flex items-center mb-3 mx-2">
              <SquareIcon icon={image} width={width} />
              <p className="text-xs ml-3 flex-1">
                {t(`deepdungeon.guideDescription`, {
                  description: description,
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
