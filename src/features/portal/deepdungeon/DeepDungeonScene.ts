import mapJson2 from "assets/map/DeepDungeonMap1.json";
import tilesetconfig from "assets/map/Tileset-deep-dungeon.json";
import { SceneId } from "features/world/mmoMachine";
import { SQUARE_WIDTH } from "features/game/lib/constants";
import { BaseScene, NPCBumpkin } from "features/world/scenes/BaseScene";
import { MachineInterpreter } from "./lib/portalMachine";

import mapJson from "assets/map/plaza.json";

export const NPCS: NPCBumpkin[] = [
  {
    x: 380,
    y: 400,
    // View NPCModals.tsx for implementation of pop up modal
    npc: "portaller",
  },
];

export class DeepDungeonScene extends BaseScene {
  sceneId: SceneId = "portal_example";

  constructor() {
    super({
      name: "portal_example",
      map: {
        json: mapJson,
      },
      audio: { fx: { walk_key: "dirt_footstep" } },
    });
  }

  preload() {
    super.preload();
  }

  async create() {
    this.map = this.make.tilemap({
      key: "festival_of_colors",
    });

    super.create();

    this.initialiseNPCs(NPCS);
  }

  public get portalService() {
    return this.registry.get("portalService") as MachineInterpreter | undefined;
  }
}