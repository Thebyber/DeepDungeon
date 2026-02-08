import mapJson from "assets/map/DeepDungeonMap1.json";
import tilesetconfig from "assets/map/Tileset-deep-dungeon.json";
import { SceneId } from "features/world/mmoMachine";
import { BaseScene, NPCBumpkin } from "features/world/scenes/BaseScene";
import { GridMovement } from "./lib/GridMovement";
export const NPCS: NPCBumpkin[] = [
  {
    x: 380,
    y: 400,
    // View NPCModals.tsx for implementation of pop up modal
    npc: "portaller",
  },
];

export class DeepDungeonScene extends BaseScene {
  sceneId: SceneId = "deep_dungeon";
  private gridMovement?: GridMovement;

  constructor() {
    super({
      name: "deep_dungeon",
      map: {
        json: mapJson,
        imageKey: "Tileset-deep-dungeon",
        defaultTilesetConfig: tilesetconfig,
      },
    });
  }

  preload() {
    super.preload();
  }

  async create() {
    this.map = this.make.tilemap({ key: "deep_dungeon" });
    super.create();

    if (this.currentPlayer) {
      // Corregimos el error de tipado del body
      const body = this.currentPlayer.body as Phaser.Physics.Arcade.Body;
      if (body) {
        body.enable = false;
      }

      this.gridMovement = new GridMovement(
        this,
        this.currentPlayer,
        16,
        this.layers,
      );
    }
  }

  update() {
    // Anulamos velocidad por si acaso
    const body = this.currentPlayer?.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setVelocity(0, 0);
    }

    super.update();

    if (this.cursorKeys) {
      // Pasamos las teclas como un Record para evitar conflictos de tipos
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.gridMovement?.handleInput(this.cursorKeys as any);
    }
  }
}
