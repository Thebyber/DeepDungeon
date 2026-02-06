import mapJson from "assets/map/plaza.json";
import mapJson2 from "assets/map/DeepDungeonMap1.json";
import { SceneId } from "features/world/mmoMachine";
import { BaseScene, NPCBumpkin } from "features/world/scenes/BaseScene";
import { MachineInterpreter } from "./lib/portalMachine";

export const NPCS: NPCBumpkin[] = [
  {
    x: 380,
    y: 400,
    // View NPCModals.tsx for implementation of pop up modal
    npc: "portaller",
  },
];

export class PortalExampleScene extends BaseScene {
  sceneId: SceneId = "deep_dungeon";

  constructor() {
    super({
      name: "deep_dungeon",
      map: {
        json: mapJson2,
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
