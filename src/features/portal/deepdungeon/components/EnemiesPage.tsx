import React, { useContext } from "react";
import { useActor } from "@xstate/react";
import { PortalContext } from "../lib/PortalProvider";
import { ENEMY_TYPES } from "../lib/Enemies"; // Tus definiciones
import { SimpleBox } from "./SimpleBox";
import { InnerPanel } from "components/ui/Panel";

export const EnemiesPage: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const [portalState] = useActor(portalService);
  const { enemiesDefeated } = portalState.context.codex;

  return (
    <InnerPanel className="flex flex-col h-full overflow-y-auto scrollable p-2">
      <div className="flex flex-wrap gap-2">
        {Object.values(ENEMY_TYPES).map((enemy) => {
          const count = enemiesDefeated[enemy.name] || 0;
          return (
            <div key={enemy.name} className="flex flex-col items-center">
              <SimpleBox
                image={`assets/enemies/${enemy.sprite}.png`}
                silhouette={count === 0}
                inventoryCount={count > 0 ? count : undefined}
              />
              <span className="text-[8px] font-pixel text-white">
                {count > 0 ? enemy.name : "???"}
              </span>
            </div>
          );
        })}
      </div>
    </InnerPanel>
  );
};
