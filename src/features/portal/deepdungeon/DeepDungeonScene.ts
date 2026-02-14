import mapJson from "assets/map/DeepDungeonMap1.json";
import tilesetconfig from "assets/map/Tileset-deep-dungeon.json";
import { SceneId } from "features/world/mmoMachine";
import { BaseScene, NPCBumpkin } from "features/world/scenes/BaseScene";
import { GridMovement } from "./lib/GridMovement";
import { ENEMY_TYPES, EnemyType } from "./lib/Enemies";
import { EnemyContainer } from "./containers/EnemyContainer";
import { AnimationKeys } from "./DeepDungeonConstants";
//import { ANIMATION } from "features/world/lib/animations";

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
  private enemies: EnemyContainer[] = [];
  private playerKeys?: Record<string, Phaser.Input.Keyboard.Key>;
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
    //Enemies
    //Skeleton
    this.load.spritesheet("skeleton", "world/DeepDungeonAssets/skeleton.png", {
      frameWidth: 96,
      frameHeight: 64,
    });
    this.load.spritesheet(
      "skeleton_idle",
      "world/DeepDungeonAssets/skeleton_idle1.png",
      {
        frameWidth: 32,
        frameHeight: 16,
      },
    );
    this.load.spritesheet(
      "skeleton_hurt",
      "world/DeepDungeonAssets/skeleton_hurt_strip7.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(
      "skeleton_walk",
      "world/DeepDungeonAssets/skeleton_walk_strip8.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(
      "skeleton_attack",
      "world/DeepDungeonAssets/skeleton_attack_strip7.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(
      "skeleton_death",
      "world/DeepDungeonAssets/skeleton_death_strip10.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
  }

  async create() {
    this.map = this.make.tilemap({ key: "deep_dungeon" });
    super.create();
    if (this.currentPlayer) {
      // 1. Iniciar GridMovement
      const startX = 160 + 8;
      const startY = 128 + 4;
      this.currentPlayer.setPosition(startX, startY);
      const player = this.currentPlayer as any;
      player.onPreUpdate = () => {};
      // 2. Quitamos cualquier velocidad que la BaseScene intente aplicar
      const body = this.currentPlayer.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(0, 0);
      body.setMaxVelocity(0, 0);
      this.gridMovement = new GridMovement(
        this,
        this.currentPlayer,
        16,
        this.layers,
      );
      //Asignacion de teclas
      if (this.input.keyboard) {
        this.playerKeys = {
          ATTACK: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
          HURT: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
          DEATH: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
          MINE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
          DIG: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X),
          AXE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.V),
        };
      }

      // 2. Crear un esqueleto de prueba
      const skeleton = new EnemyContainer({
        scene: this,
        x: 152, // Offset centrado
        y: 132,
        player: this.currentPlayer,
        type: "SKELETON",
      });
      this.enemies.push(skeleton);

      // 3. ESCUCHAR EL MOVIMIENTO
      this.events.on("PLAYER_MOVED", () => {
        this.enemies.forEach((enemy) => enemy.updateMovement());
      });
      // Lanzar HUD
      this.scene.run("DungeonHUD");
      this.scene.bringToTop("DungeonHUD");
    }
  }
  public spawnEnemy(type: EnemyType, x: number, y: number) {
    const stats = ENEMY_TYPES[type];
    // Creamos el sprite (ajusta 'slime_green' por el nombre real de tu asset)
    const enemy = this.add.sprite(x, y, stats.sprite);
    // Guardamos sus stats dentro del objeto para usarlos en el combate
    enemy.setData("stats", stats);
  }
  update() {
    // Anulamos velocidad por si acaso
    const body = this.currentPlayer?.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setVelocity(0, 0);
    }
    if (this.cursorKeys) {
      // Pasamos las teclas como un Record para evitar conflictos de tipos
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.gridMovement?.handleInput(this.cursorKeys as any);
    }
    this.loadBumpkinAnimations();
    super.update();
    this.handlePlayerActions();
  }
  private loadBumpkinAnimations() {
    if (!this.currentPlayer) return;
    if (!this.cursorKeys) return;
    let animation!: AnimationKeys;
    if (
      !this.currentPlayer.isHurting &&
      !this.currentPlayer.isAttacking &&
      !this.currentPlayer.isMining &&
      !this.currentPlayer.isAxe &&
      !this.currentPlayer.isHammering &&
      !this.currentPlayer.isSwimming &&
      !this.currentPlayer.isDrilling &&
      !this.currentPlayer.isDigging &&
      !this.currentPlayer.isWalking
    ) {
      animation = "idle";
    }
    this.currentPlayer?.[animation]?.();
  }
  private handlePlayerActions() {
    if (!this.currentPlayer || !this.playerKeys) return;

    const player = this.currentPlayer; // Usaremos una interfaz luego para evitar any

    // Al presionar "E" (JustDown para que no se repita en bucle)
    if (Phaser.Input.Keyboard.JustDown(this.playerKeys.ATTACK)) {
      player.attack();
    }
    if (Phaser.Input.Keyboard.JustDown(this.playerKeys.AXE)) {
      player.axe();
    }
    if (Phaser.Input.Keyboard.JustDown(this.playerKeys.MINE)) {
      player.mining();
    }
    if (Phaser.Input.Keyboard.JustDown(this.playerKeys.DIG)) {
      player.dig();
    }
    // Al presionar "2"
    if (Phaser.Input.Keyboard.JustDown(this.playerKeys.HURT)) {
      player.hurt();
    }

    // Al presionar "1"
    if (Phaser.Input.Keyboard.JustDown(this.playerKeys.DEATH)) {
      player.dead();
    }
  }
}
