import tilesetConfig from "assets/map/Tileset-deep-dungeon.json";
import { SceneId } from "features/world/mmoMachine";
import { BaseScene, NPCBumpkin } from "features/world/scenes/BaseScene";
import { GridMovement } from "./lib/GridMovement";
import { ENEMY_TYPES, EnemyType } from "./lib/Enemies";
import { EnemyContainer } from "./containers/EnemyContainer";
import { EventObject } from "xstate";
import {
  AnimationKeys,
  CRYSTAL_DROP_TABLE,
  PORTAL_NAME,
} from "./DeepDungeonConstants";
//import { ANIMATION } from "features/world/lib/animations";
import { PickaxeContainer } from "./containers/PickaxeContainer";
import { TrapContainer } from "./containers/TrapContainer";
import { StairContainer } from "./containers/StairContainer"; // Ajusta la ruta
import { CrystalContainer } from "./containers/CrystalContainer"; // Ajusta la ruta
import { LEVEL_DESIGNS } from "./DeepDungeonConstants";
import { LEVEL_MAPS } from "./DeepDungeonConstants";
import { MachineInterpreter } from "./lib/portalMachine";
import { GameState } from "features/game/types/game";

export const NPCS: NPCBumpkin[] = [
  {
    x: 380,
    y: 400,
    // View NPCModals.tsx for implementation of pop up modal
    npc: "portaller",
  },
];

// Tipos para Cristales
type CrystalType = "pink" | "white" | "blue" | "prismora";
interface LootConfig {
  [key: string]: number;
}

// Interfaz extendida para el Jugador (Bumpkin)
interface IDungeonPlayer extends Phaser.GameObjects.Container {
  gridMovement?: GridMovement;
  isDead: boolean;
  isAttacking: boolean;
  isHurting: boolean;
  isMining: boolean;
  isAxe: boolean;
  isHammering: boolean;
  isSwimming: boolean;
  isDrilling: boolean;
  isDigging: boolean;
  isWalking: boolean;
  // Métodos de animación
  idle(): void;
  attack(): void;
  axe(): void;
  mining(): void;
  dig(): void;
  hurt(): void;
  dead(): void;
  // Acceso a las animaciones dinámicas (línea 441)
  [key: string]: any;
}

export class DeepDungeonScene extends BaseScene {
  private _portalService: MachineInterpreter | undefined;
  sceneId: SceneId = PORTAL_NAME;
  private gridMovement?: GridMovement;
  public enemies: EnemyContainer[] = [];
  private playerKeys?: Record<string, Phaser.Input.Keyboard.Key>;
  private traps: TrapContainer[] = [];
  private currentLevel: number = 1;
  private isTransitioning: boolean = false;
  public mapKey!: string;
  private occupiedTiles: Set<string> = new Set();
  public crystals: CrystalContainer[] = [];
  private energyOrbsGroup!: Phaser.Physics.Arcade.Group;
  private darknessMask?: Phaser.GameObjects.RenderTexture;
  private visionCircle?: Phaser.GameObjects.Graphics;
  private backgroundMusic!: Phaser.Sound.BaseSound;
  private lastAttempt!: number;
  private _lastFogX: number = -1;
  private _lastFogY: number = -1;
  private swipeLeft = false;
  private swipeRight = false;
  private swipeUp = false;
  private swipeDown = false;
  groundLayer: any;
  wallLayer: any;

  public get portalService() {
    return this.registry.get("portalService") as MachineInterpreter | undefined;
  }

  constructor() {
    super({
      name: PORTAL_NAME,
      map: {
        imageKey: "Tileset-deep-dungeon",
        defaultTilesetConfig: tilesetConfig,
        json: undefined,
      },
    });
  }
  init(data: { level?: number }) {
    if (data && data.level !== undefined) {
      this.currentLevel = data.level;
    } else {
      this.currentLevel = 1;
    }
    this.isTransitioning = false;

    // Ya no enviamos "UPDATE_STATS" aquí porque NEXT_MAP ya se encargó
    // de subir el nivel y resetear los contadores.

    if (this.cache.tilemap.has("deep-dungeon")) {
      this.cache.tilemap.remove("deep-dungeon");
    }
  }

  private restartGameScene = () => {
    if (!this.scene.manager || this.sys.isActive() === false) return;
    this.scene.restart({ level: 1 });
  };

  private onStart = (event: EventObject) => {
    if (!this.sys || !this.sys.isActive() || !this.sys.displayList) return;
    if (event.type === "START") {
      this.initializeCreates();
    }
  };

  private onRetry = (event: EventObject) => {
    if (!this.sys || !this.sys.isActive() || !this.sys.displayList) return;
    if (event.type === "RETRY") {
      this.restartGameScene();
    }
  };

  private onContinue = (event: EventObject) => {
    if (!this.sys || !this.sys.isActive() || !this.sys.displayList) return;
    if (event.type === "CONTINUE") {
      this.restartGameScene();
    }
  };
  private initialiseEvents() {
    const portalService = this.portalService;
    if (!portalService) return;

    const mainEvents = [this.onStart, this.onRetry, this.onContinue];

    const resetMainEvents = () => {
      mainEvents.forEach((event) => {
        portalService.off(event);
      });
    };

    // Limpiar por si acaso
    resetMainEvents();

    // Registrar eventos
    mainEvents.forEach((event) => {
      portalService.onEvent(event);
    });

    // Limpiar al destruir escena
    this.events.once("shutdown", resetMainEvents);
    this.events.once("destroy", resetMainEvents);
  }
  private initializeCreates() {
    // Reset de estado importante
    this.isTransitioning = false;
    this.occupiedTiles.clear();
  }
  private initialiseProperties() {
    this.enemies = [];
    this.traps = [];
    this.crystals = [];
    this.occupiedTiles.clear();
    this.isTransitioning = false;
  }

  preload() {
    // Usamos SIEMPRE la misma llave: "deep-dungeon"
    const mapKey = "deep-dungeon";
    const mapIndex = ((this.currentLevel - 1) % 10) + 1;
    const mapPath = `world/DeepDungeonAssets/map${mapIndex}.json`;

    //console.log(`Cargando nivel ${this.currentLevel} desde ${mapPath}`);

    // Al usar la misma llave, Phaser reemplaza los datos del nivel anterior
    this.load.tilemapTiledJSON(mapKey, mapPath);

    //Crystals
    const tipos = ["pink", "white", "blue", "prismora"];

    tipos.forEach((tipo) => {
      // Usamos un bucle del 1 al 5
      for (let i = 1; i <= 5; i++) {
        const key = `${tipo}_crystal_${i}`;
        const path = `world/DeepDungeonAssets/${key}.png`;

        this.load.image(key, path);
      }
    });

    super.preload();
    this.load.image("stairs", "world/DeepDungeonAssets/Stairs.png");
    //Music
    // Background
    this.load.audio(
      "backgroundMusic",
      "/world/DeepDungeonAssets/backgroundMusic.wav",
    );
    //Bumpkin sounds
    this.load.audio(
      "sword_attack",
      "/world/DeepDungeonAssets/sword_attack.mp3",
    );
    this.load.audio("swimming", "/world/DeepDungeonAssets/swimming.mp3");
    this.load.audio(
      "dead_bumpkin",
      "/world/DeepDungeonAssets/dead_bumpkin.mp3",
    );
    //Enemies sounds
    this.load.audio(
      "skeleton_attack",
      "/world/DeepDungeonAssets/skeleton_attack.mp3",
    );
    this.load.audio(
      "knight_attack",
      "/world/DeepDungeonAssets/knight_attack.mp3",
    );
    this.load.audio(
      "frankenstein_attack",
      "/world/DeepDungeonAssets/frankenstein_attack.wav",
    );
    this.load.audio(
      "frankenstein_attackAoE",
      "/world/DeepDungeonAssets/frankenstein_attackAoE.mp3",
    );
    this.load.audio(
      "devil_attack",
      "/world/DeepDungeonAssets/devil_attack.wav",
    );
    this.load.audio(
      "devil_attackAoE",
      "/world/DeepDungeonAssets/devil_attackAoE.wav",
    );
    this.load.audio(
      "dead_enemies",
      "/world/DeepDungeonAssets/dead_enemies.mp3",
    );
    //Trap sounds
    this.load.audio("spikes_trap", "/world/DeepDungeonAssets/spikes_trap.mp3");

    //Crystal break sound
    this.load.audio(
      "mine_crystal",
      "/world/DeepDungeonAssets/mine_crystal.mp3",
    );
    //Sounds for level up, card selection, win rewards, etc.
    this.load.audio("next_level", "/world/DeepDungeonAssets/next_level.mp3");
    this.load.audio("card_sound", "/world/DeepDungeonAssets/card_sound.mp3");
    this.load.audio(
      "reroll_cards",
      "/world/DeepDungeonAssets/reroll_cards.mp3",
    );
    this.load.audio("win_energy", "/world/DeepDungeonAssets/win_energy.mp3");
    this.load.audio("win_item", "/world/DeepDungeonAssets/win_item.mp3");

    //Trampas
    this.load.spritesheet("spikes", "world/DeepDungeonAssets/spikes.png", {
      frameWidth: 96,
      frameHeight: 64,
    });
    this.load.spritesheet("spikes2", "world/DeepDungeonAssets/spikes2.png", {
      frameWidth: 96,
      frameHeight: 64,
    });
    //Heart icon
    this.load.image("heart_icon", "world/DeepDungeonAssets/heart.png");
    //Energy orbs
    this.load.image("lightning", "world/DeepDungeonAssets/lightning.png");
    this.load.spritesheet(
      "lightning5", // ESTA ES LA DE 6-10 ENERGÍA
      "world/DeepDungeonAssets/lightning5.png",
      {
        frameWidth: 12,
        frameHeight: 12,
      },
    );
    this.load.spritesheet(
      "lightning10", // ESTA ES LA DE 6-10 ENERGÍA
      "world/DeepDungeonAssets/lightning10.png",
      {
        frameWidth: 16,
        frameHeight: 12,
      },
    );
    //Enemies
    //Skeleton
    this.load.spritesheet(
      "pickaxe_sprite",
      "world/DeepDungeonAssets/pickaxe.png",
      {
        frameWidth: 13,
        frameHeight: 13,
      },
    );
    this.load.spritesheet(
      "energy_big",
      "world/DeepDungeonAssets/lightning10.png",
      {
        frameWidth: 16,
        frameHeight: 12,
      },
    );
    this.load.spritesheet(
      "energy_small",
      "world/DeepDungeonAssets/lightning5.png",
      {
        frameWidth: 12,
        frameHeight: 12,
      },
    );
    this.load.image("sword", "world/DeepDungeonAssets/sword.png");
    this.load.image("shield", "world/DeepDungeonAssets/shield.png");
    this.load.image("crit", "world/DeepDungeonAssets/crit.png");
    this.load.image("pickaxe", "world/DeepDungeonAssets/pickaxe.png");
    this.load.spritesheet("skeleton", "world/DeepDungeonAssets/skeleton.png", {
      frameWidth: 13,
      frameHeight: 16,
    });
    this.load.spritesheet(
      "skeleton_idle",
      "world/DeepDungeonAssets/skeleton_idle.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(
      "skeleton_hurt",
      "world/DeepDungeonAssets/skeleton_hurt.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(
      "skeleton_walk",
      "world/DeepDungeonAssets/skeleton_walk.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(
      "skeleton_attack",
      "world/DeepDungeonAssets/skeleton_attack.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(
      "skeleton_dead",
      "world/DeepDungeonAssets/skeleton_death.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    //Khight
    this.load.spritesheet(
      "knight_idle",
      "world/DeepDungeonAssets/knight_idle.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(
      "knight_hurt",
      "world/DeepDungeonAssets/knight_hurt.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(
      "knight_walk",
      "world/DeepDungeonAssets/knight_walk.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(
      "knight_attack",
      "world/DeepDungeonAssets/knight_attack.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(
      "knight_dead",
      "world/DeepDungeonAssets/knight_death.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    //Frankenstein
    this.load.spritesheet(
      "frankenstein_idle",
      "world/DeepDungeonAssets/frankenstein_idle.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(
      "frankenstein_hurt",
      "world/DeepDungeonAssets/frankenstein_hurt.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(
      "frankenstein_walk",
      "world/DeepDungeonAssets/frankenstein_walk.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(
      "frankenstein_attack",
      "world/DeepDungeonAssets/frankenstein_attack.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(
      "frankenstein_attackAoE",
      "world/DeepDungeonAssets/frankenstein2_attack.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(
      "frankenstein_dead",
      "world/DeepDungeonAssets/frankenstein_death.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    //Devil
    this.load.spritesheet(
      "devil_idle",
      "world/DeepDungeonAssets/devil_idle.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(
      "devil_hurt",
      "world/DeepDungeonAssets/devil_hurt.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(
      "devil_walk",
      "world/DeepDungeonAssets/devil_walk.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(
      "devil_attack",
      "world/DeepDungeonAssets/devil3_attack.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(
      "devil_attackAoE",
      "world/DeepDungeonAssets/devil2_attack.png",
      {
        frameWidth: 96,
        frameHeight: 96,
      },
    );
    this.load.spritesheet(
      "devil_dead",
      "world/DeepDungeonAssets/devil_death.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
  }

  async create() {
    this.initialiseProperties();
    super.create();
    this.initialiseEvents();
    this.occupiedTiles.clear(); // Limpiar al iniciar el nivel
    this.energyOrbsGroup = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
    });
    // 2. Ahora vinculamos las capas que BaseScene ya creó por nosotros
    // El objeto 'this.layers' se llena automáticamente en BaseScene.initialiseMap()
    this.groundLayer = this.layers["Ground"];
    this.wallLayer = this.layers["Wall"];

    // 3. Si por algún motivo BaseScene no las creó (a veces pasa si los nombres no coinciden),
    // las forzamos nosotros:
    if (!this.groundLayer) {
      const tileset = this.map.getTileset("Tileset-deep-dungeon"); // Nombre en Tiled
      this.groundLayer = this.map.createLayer("Ground", tileset!, 0, 0);
      this.wallLayer = this.map.createLayer("Wall", tileset!, 0, 0);
    }
    if (this.wallLayer) {
      this.physics.add.collider(this.energyOrbsGroup, this.wallLayer);
    }

    // 4. Activar colisiones para el movimiento celda a celda
    const player = this.currentPlayer as any;
    if (player?.gridMovement) {
      this.gridMovement = new GridMovement(this, player, 16, {
        walls: this.wallLayer as Phaser.Tilemaps.TilemapLayer,
      });
    }
    // --- NUEVO: Configurar que el jugador recoja la energía al tocarla ---
    if (this.currentPlayer) {
      this.physics.add.overlap(
        this.currentPlayer,
        this.energyOrbsGroup,
        (p, orb) => this.collectEnergy(orb as Phaser.Physics.Arcade.Sprite),
        undefined,
        this,
      );
    }

    const levelData = LEVEL_MAPS[this.currentLevel];

    this.backgroundMusic = this.sound.add("backgroundMusic", {
      loop: true,
      volume: 0.2,
    });
    this.backgroundMusic.play();

    if (this.currentPlayer) {
      // 2. Usar las coordenadas de la constante
      const startX = levelData.playerStart.x + 8;
      const startY = levelData.playerStart.y + 4;
      this.currentPlayer.setPosition(startX, startY);

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
      // --- AÑADE AQUÍ EL CONTROL DE SWIPE ---
      this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
        const swipeThreshold = 50;
        const dragX = pointer.upX - pointer.downX;
        const dragY = pointer.upY - pointer.downY;

        if (Math.max(Math.abs(dragX), Math.abs(dragY)) > swipeThreshold) {
          if (Math.abs(dragX) > Math.abs(dragY)) {
            if (dragX > 0) {
              this.swipeRight = true;
            } else {
              this.swipeLeft = true;
            }
          } else {
            if (dragY > 0) {
              this.swipeDown = true;
            } else {
              this.swipeUp = true;
            }
          }
        }
      });
      //const playerState = PlayerState.getInstance();
      //const currentLevel = PlayerState.getInstance().getLevel();

      this.buildLevel(this.currentLevel);
      // Ahora sí, sincronizamos el estado global para el resto del juego
      //PlayerState.getInstance().setLevel(this.currentLevel);

      // 3. ESCUCHAR EL MOVIMIENTO
      this.events.on("PLAYER_MOVED", () => {
        this.enemies.forEach((enemy) => {
          if (enemy && enemy.active) {
            enemy.updateMovement();
          }
        });
      });
      this.createFog();
      // Lanzar HUD
      this.scene.run("DungeonHUD");
      this.scene.bringToTop("DungeonHUD");
    }
    this.events.once("shutdown", () => {
      this.events.off("PLAYER_MOVED");
      this.backgroundMusic.stop(); // Evita que la música se solape al cambiar de nivel
    });
    if (this.portalService) {
      // Forzamos un evento para que el HUD se entere de los stats actuales
      const stats = this.portalService.state.context.stats;
      this.portalService.send("UPDATE_STATS", { stats });
    }
  }

  update() {
    super.update();

    if (!this.currentPlayer || !this.cursorKeys) return;
    //if (this.currentPlayer.isDead) return;
    // SEGURIDAD: Si el jugador no tiene ningún tween activo y no está muerto,
    // pero GridMovement dice que se está moviendo, lo liberamos tras un pequeño margen.
    if (
      this.gridMovement &&
      (this.gridMovement as any).isMoving &&
      !this.tweens.isTweening(this.currentPlayer)
    ) {
      // Si han pasado más de 500ms y no hay movimiento real, desbloqueamos
      (this.gridMovement as any).isMoving = false;
    }
    if (this.isPlaying) {
      // 1. Usamos encadenamiento opcional (?.) para evitar el error de TS
      const state = this.portalService?.state.value;
      const stats = this.portalService?.state.context.stats;

      // 2. Si no hay gridMovement, no seguimos
      if (!this.gridMovement) return;

      // 3. SEGURIDAD: Si estamos en juego y no nos movemos, reseteamos el flag
      // Esto evita que te quedes "congelado" como en el vídeo
      if (state === "playing" && !this.currentPlayer.isMoving) {
        this.gridMovement.setFrozen(false);
        // Si tienes acceso a isMoving dentro de GridMovement, podrías forzarlo:
        // (this.gridMovement as any).isMoving = false;
      }

      // SEGURIDAD: Si no estamos en playing, congelamos. Si estamos, descongelamos.
      if (state !== "playing") {
        this.gridMovement?.setFrozen(true); // <--- Añade el ?
        return;
      } else {
        this.gridMovement?.setFrozen(false); // <--- Añade el ?
      }

      // Si la energía cae a 0 o menos mientras caminamos, forzamos muerte
      if (stats && stats.energy <= 0 && !this.currentPlayer.isDead) {
        this.handlePlayerDeath();
        return;
      }

      const body = this.currentPlayer.body as Phaser.Physics.Arcade.Body;
      if (body) {
        body.setVelocity(0, 0);
      }

      // --- 1. FILTRO DE ESTADO ---
      // Si el jugador está atacando o sufriendo daño, BLOQUEAMOS el input.
      // Esto evita que "atropelles" enemigos o que las animaciones se pisen.
      const isBusy =
        this.currentPlayer.isAttacking ||
        this.currentPlayer.isHurting ||
        this.currentPlayer.isMining;

      if (!isBusy) {
        // Solo permitimos movimiento y acciones si NO está ocupado
        // PONER:
        this.gridMovement?.handleInput({
          ...this.cursorKeys,
          left: { isDown: this.cursorKeys?.left?.isDown || this.swipeLeft },
          right: { isDown: this.cursorKeys?.right?.isDown || this.swipeRight },
          up: { isDown: this.cursorKeys?.up?.isDown || this.swipeUp },
          down: { isDown: this.cursorKeys?.down?.isDown || this.swipeDown },
        } as any);

        // Resetear swipe después de pasarlo al input
        this.swipeLeft = false;
        this.swipeRight = false;
        this.swipeUp = false;
        this.swipeDown = false;
        this.handlePlayerActions(); // Aquí es donde disparas el ataque
      }

      // --- 2. ANIMACIONES Y MÁSCARA ---
      // Las animaciones deben seguir actualizándose (o el sistema de control de estas)
      this.loadBumpkinAnimations();

      if (this.darknessMask && this.visionCircle) {
        const x = Math.round(this.currentPlayer.x);
        const y = Math.round(this.currentPlayer.y);
        if (x !== this._lastFogX || y !== this._lastFogY) {
          this.darknessMask.erase(this.visionCircle, x, y);
          this._lastFogX = x;
          this._lastFogY = y;
        }
      }
    }
    if (this.isReady) {
      this.portalService?.send("START");
      this.lastAttempt = this.time.now;
      this.currentPlayer.isDead = false;
      this.currentPlayer.idle();
      this.gridMovement?.setFrozen(false);
    }
  }
  /*public handleDamage(amount: number) {
    const stats = this.portalService?.state.context.stats;
    const player = this.currentPlayer as any;

    if (!stats || player.isDead) return;

    // 1. Cálculo matemático real
    const currentEnergy = stats.energy;
    const finalEnergy = currentEnergy - amount;

    // LOG de depuración para que veas qué pasa
    console.log(
      `🛡️ PHASER CHECK: Energía ${currentEnergy} - Daño ${amount} = ${finalEnergy}`,
    );

    // 2. SOLO MATAR SI ES 0 O MENOS
    if (finalEnergy <= 0) {
      console.log("💀 MUERTE CONFIRMADA POR PHASER");
      player.isDead = true;

      // Sincronizamos la máquina a 0
      this.portalService?.send("UPDATE_STATS", { stats: { energy: 0 } });

      // Ejecutamos la secuencia de muerte que ya tienes
      this.handlePlayerDeath();
    }
    // 3. SI SOBREVIVE (aunque sea con 1 de vida)
    else {
      console.log("💪 SOBREVIVE. Actualizando vida en la máquina...");

      // IMPORTANTE: Usamos UPDATE_STATS en lugar de HIT_TRAP si HIT_TRAP está dando errores
      this.portalService?.send("UPDATE_STATS", {
        stats: { energy: finalEnergy },
      });

      if (typeof player.hurt === "function") {
        player.hurt();
      }
    }
  }*/
  // Nuevo método en la escena:
  /*public handlePlayerDeath() {
    // 1. PRIORIDAD: Usar un flag local para evitar que el error se repita en bucle
    if (
      this.isTransitioning ||
      !this.currentPlayer ||
      (this.currentPlayer as any).isDead
    ) {
      return;
    }

    // Marcamos muerte inmediata en Phaser para que ninguna otra función (como movimiento) se ejecute
    (this.currentPlayer as any).isDead = true;
    this.isTransitioning = true;

    console.log("☠️ Secuencia de muerte iniciada");

    // 2. DETENER TODO EL MOVIMIENTO
    if (this.gridMovement) {
      this.gridMovement.setFrozen(true);
    }

    // 3. EJECUTAR ANIMACIÓN (Asegúrate de que el método existe)
    try {
      if (typeof this.currentPlayer.dead === "function") {
        this.currentPlayer.dead();
      } else {
        // Si no existe .dead(), forzamos la animación por clave
        (this.currentPlayer as any).play("death", true);
      }

      this.sound.play("dead_bumpkin", { volume: 0.75 });
    } catch (e) {
      console.error("Error al reproducir animación de muerte:", e);
    }

    // 4. RETRASO PARA EL CARTEL DE REACT
    // No envíes GAME_OVER al instante, o React destruirá la escena antes de ver la animación
    this.time.delayedCall(2000, () => {
      if (this.portalService) {
        this.portalService.send("GAME_OVER");
      }
    });
  }*/
  /** 🛡️ RECIBIR DAÑO (Enemigo/Trampa -> Jugador) */
  public handlePlayerDamage(
    baseAttack: number,
    critchancebase?: number,
    canCrit: boolean = false,
  ) {
    const stats = this.portalService?.state.context.stats;
    const player = this.currentPlayer as any;
    if (!stats || player.isDead) return;

    // 1. Crítico del Enemigo — solo si el origen es un ataque real
    const isCrit = canCrit && Math.random() < (critchancebase || 0.1);

    const attackAfterCrit = isCrit ? baseAttack * 2 : baseAttack;

    // 2. Mitigación por TU DEFENSA
    const damageDealt = Math.max(
      1,
      Math.round(attackAfterCrit - (stats.defense || 0)),
    );
    const energyResult = stats.energy - damageDealt;

    if (canCrit && this.currentPlayer) {
      const px = this.currentPlayer.x;
      const py = this.currentPlayer.y;
      if (isCrit) {
        this.spawnCritText(px, py, true);
        this.time.delayedCall(300, () => {
          this.spawnDamageText(px, py, damageDealt, true);
        });
      } else {
        this.spawnDamageText(px, py, damageDealt, true);
      }
    }

    if (energyResult <= 0 || player.isDead) {
      this.portalService?.send("UPDATE_STATS", { stats: { energy: 0 } });
      this.handlePlayerDeath();
    } else {
      this.portalService?.send("HIT_TRAP", { damage: damageDealt });
    }
  }

  /** ⚔️ HACER DAÑO (Jugador -> Enemigo) */
  //cuando añada armas: public handleEnemyDamage(enemy: EnemyContainer, weaponDamage: number)
  public handleEnemyDamage(enemy: EnemyContainer) {
    const stats = this.portalService?.state.context.stats;
    if (!stats) return;

    // 1. Determinar si es crítico
    const isCrit = Math.random() < (stats.criticalChance || 0.1);

    // 2. Calcular el daño base (Ataque del jugador)
    const baseAttack = stats.attack || 1;

    // 3. Aplicar el multiplicador en una nueva variable constante
    // Si es crítico multiplicamos por 2, si no, por 1
    const multiplier = isCrit ? 2 : 1;
    const totalAttack = baseAttack * multiplier;

    // 4. Mitigación por DEFENSA DEL ENEMIGO
    const damageDealt = Math.max(
      1,
      Math.round(totalAttack - (enemy.stats.defense || 0)),
    );

    if (isCrit) {
      this.spawnCritText(enemy.x, enemy.y, false);
      this.time.delayedCall(300, () => {
        this.spawnDamageText(enemy.x, enemy.y, damageDealt, false);
      });
    } else {
      this.spawnDamageText(enemy.x, enemy.y, damageDealt, false);
    }

    // 5. Aplicar daño al enemigo
    enemy.takeDamage(damageDealt, isCrit);
  }

  /** 💀 SECUENCIA DE MUERTE */
  public handlePlayerDeath() {
    // 1. PRIORIDAD: Usar un flag local para evitar que el error se repita en bucle
    if (
      this.isTransitioning ||
      !this.currentPlayer ||
      (this.currentPlayer as any).isDead
    ) {
      return;
    }

    // Marcamos muerte inmediata en Phaser para que ninguna otra función (como movimiento) se ejecute
    (this.currentPlayer as any).isDead = true;
    this.isTransitioning = true;

    // 2. DETENER TODO EL MOVIMIENTO

    // 3. EJECUTAR ANIMACIÓN (Asegúrate de que el método existe)

    this.currentPlayer.dead();

    this.sound.play("dead_bumpkin", { volume: 0.75 });

    if (this.gridMovement) {
      this.gridMovement.setFrozen(true);
    }

    // 4. RETRASO PARA EL CARTEL DE REACT
    // No envíes GAME_OVER al instante, o React destruirá la escena antes de ver la animación
    this.time.delayedCall(2000, () => {
      if (this.portalService) {
        this.portalService.send("GAME_OVER");
      }
    });
  }

  private loadBumpkinAnimations() {
    if (!this.currentPlayer || this.currentPlayer.isDead) return;
    if (!this.cursorKeys) return;
    if (
      this.currentPlayer.isMining ||
      this.currentPlayer.isAttacking ||
      this.currentPlayer.isHurting ||
      this.currentPlayer.isSwimming
    ) {
      return;
    }
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

    return this.currentPlayer?.[animation]?.();
  }
  public spawnEnemy(type: EnemyType, x: number, y: number) {
    const stats = ENEMY_TYPES[type];
    // Creamos el sprite
    const enemy = this.add.sprite(x, y, stats.sprite);
    // Guardamos sus stats dentro del objeto para usarlos en el combate
    enemy.setData("stats", stats);
  }
  public checkTrapsAt(worldX: number, worldY: number) {
    // 1. Convertimos la posición de entrada a coordenadas de rejilla (Tiles)
    const tx = Math.floor(worldX / 16);
    const ty = Math.floor(worldY / 16);

    if (!this.traps || this.traps.length === 0) return;

    // 2. Buscamos SI EXISTE una trampa en esa posición específica
    const trapAtPos = this.traps.find(
      (t) => Math.floor(t.x / 16) === tx && Math.floor(t.y / 16) === ty,
    );

    // Si no hay trampa donde se ha movido el personaje, salimos
    if (!trapAtPos) return;

    // 3. ¡HAY TRAMPA! La activamos visualmente
    //trapAtPos.activate(PlayerState.getInstance().getLevel());
    const currentLevel =
      this.portalService?.state.context.stats.currentLevel || 1;
    trapAtPos.activate();
    this.sound.play("spikes_trap", { volume: 0.5 });
    // 4. ¿EL JUGADOR PISÓ LA TRAMPA?
    if (this.currentPlayer) {
      const pTx = Math.floor(this.currentPlayer.x / 16);
      const pTy = Math.floor(this.currentPlayer.y / 16);

      if (tx === pTx && ty === pTy) {
        const damage = currentLevel <= 5 ? 2 : 5;

        // Comprobamos si este golpe matará al jugador
        const currentEnergy =
          this.portalService?.state.context.stats.energy ?? 0;
        this.portalService?.send("HIT_TRAP", { damage });
        this.spawnDamageText(
          this.currentPlayer.x,
          this.currentPlayer.y,
          damage,
          true,
        );
        if (currentEnergy - damage <= 0) {
          //2. SI LA TRAMPA TE MATA, EJECUTAMOS LA MUERTE
          this.handlePlayerDeath();
          return;
        }

        if (this.currentPlayer.hurt) this.currentPlayer.hurt();
        return;
      }
    }

    // 5. ¿UN ENEMIGO PISÓ LA TRAMPA?
    // Solo filtramos los enemigos que estén EXACTAMENTE en esa baldosa
    const enemiesOnTrap = this.enemies.filter((enemy) => {
      const eTx = Math.floor(enemy.x / 16);
      const eTy = Math.floor(enemy.y / 16);
      return eTx === tx && eTy === ty;
    });

    // Aplicamos daño solo a los enemigos detectados en ese punto
    enemiesOnTrap.forEach((enemy) => {
      if (enemy.takeDamage) {
        enemy.takeDamage(enemy.trapDamage);
      }
    });
  }
  public reducePlayerEnergy(amount: number) {
    const stats = this.portalService?.state.context.stats;
    if (!stats || (this.currentPlayer as any).isDead) return;

    const currentEnergy = stats.energy;
    const finalEnergy = Math.max(0, currentEnergy - amount);

    // Si el golpe es fatal (llega a 0)
    if (finalEnergy === 0) {
      (this.currentPlayer as any).isDead = true;
      this.sound.play("dead_bumpkin");
      // Ejecuta la animación
      this.handlePlayerDeath();
      // Retrasamos el envío a la máquina 1.5s para que se vea la animación
      this.time.delayedCall(1500, () => {
        this.portalService?.send("UPDATE_STATS", { stats: { energy: 0 } });
      });
    } else {
      // Si no es fatal, actualizamos normal
      this.portalService?.send("UPDATE_STATS", {
        stats: { energy: finalEnergy },
      });
    }
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
      this.handlePlayerDeath();
    }
  }
  private spawnPickaxes(count: number) {
    const layer = this.map.getLayer("Ground");
    if (!layer || !layer.tilemapLayer) return;
    const groundLayer = layer.tilemapLayer;

    // 1. Obtenemos tiles de suelo
    const validTiles = groundLayer.filterTiles(
      (tile: Phaser.Tilemaps.Tile) => tile.index !== -1,
    );

    let spawned = 0;
    let attempts = 0;
    const maxAttempts = 100; // Seguridad para evitar bucles infinitos

    while (spawned < count && attempts < maxAttempts) {
      attempts++;
      const randomTile = Phaser.Utils.Array.GetRandom(validTiles);

      // 2. Comprobar si la celda está libre (usando tu sistema de occupiedTiles)
      if (!this.isTileOccupied(randomTile.pixelX, randomTile.pixelY)) {
        const x = randomTile.getCenterX();
        const y = randomTile.getCenterY();

        // 3. Crear el pico
        new PickaxeContainer({
          scene: this,
          x: x,
          y: y,
          player: this.currentPlayer!,
        });

        // 4. Marcar como ocupado y sumar al contador
        this.markTileAsOccupied(randomTile.pixelX, randomTile.pixelY);
        spawned++;
      }
    }
  }
  private spawnEnemies(type: EnemyType, count: number) {
    const layer = this.map.getLayer("Ground");
    if (!layer || !layer.tilemapLayer) return;
    const groundLayer = layer.tilemapLayer;
    const validTiles = groundLayer.filterTiles(
      (tile: Phaser.Tilemaps.Tile) => tile.index !== -1,
    );

    if (validTiles.length === 0 || !this.currentPlayer) return;

    let spawned = 0;
    let attempts = 0;
    const maxAttempts = count * 10;

    while (spawned < count && attempts < maxAttempts) {
      attempts++;
      const randomTile =
        validTiles[Math.floor(Math.random() * validTiles.length)];
      const x = randomTile.getCenterX();
      const y = randomTile.getCenterY();

      const distanceToPlayer = Phaser.Math.Distance.Between(
        x,
        y,
        this.currentPlayer.x,
        this.currentPlayer.y,
      );

      if (distanceToPlayer > 120) {
        // --- AQUÍ ESTÁ EL CAMBIO ---
        const enemy = new EnemyContainer({
          scene: this,
          x: x,
          y: y,
          player: this.currentPlayer,
          type: type, // <--- Antes tenías 'config: ENEMY_TYPES[type]'
        });

        // IMPORTANTE: Añadirlo al array para que se mueva
        this.enemies.push(enemy);
        // Colisión con los cristales
        this.crystals.forEach((crystal) => {
          this.physics.add.collider(enemy, crystal);
        });

        spawned++;
      }

      if (spawned >= count) break;
    }
  }
  private spawnTraps(quantity: number) {
    // 1. Limpiamos y aseguramos que el array existe
    this.traps = [];
    const layer = this.map.getLayer("Ground");
    if (!layer || !layer.tilemapLayer) return;
    const groundLayer = layer.tilemapLayer;
    const validTiles = groundLayer.filterTiles(
      (tile: Phaser.Tilemaps.Tile) => tile.index > 0,
    );

    for (let i = 0; i < quantity; i++) {
      const randomIndex = Phaser.Math.Between(0, validTiles.length - 1);
      const tile = validTiles[randomIndex];

      // 2. Calculamos posición real
      const x = groundLayer.tileToWorldX(tile.x) + 8;
      const y = groundLayer.tileToWorldY(tile.y) + 8;

      // 3. CREAR Y GUARDAR
      if (!this.isTileOccupied(tile.pixelX, tile.pixelY)) {
        // Crear trampa
        const trap = new TrapContainer(this, x, y, this.currentLevel);
        this.traps.push(trap);
        this.markTileAsOccupied(tile.pixelX, tile.pixelY);
      }
      // <--- ESTO ES LO QUE FALTA

      validTiles.splice(randomIndex, 1);
    }
  }
  private spawnStairsRandomly() {
    const validTiles = this.groundLayer.filterTiles(
      (tile: Phaser.Tilemaps.Tile) => tile.index !== -1,
    );

    if (validTiles.length > 0) {
      const tile = Phaser.Utils.Array.GetRandom(
        validTiles,
      ) as Phaser.Tilemaps.Tile;

      // 1. Centramos la escalera con el ajuste de +4 que pediste
      const centerX = tile.getCenterX();
      const centerY = tile.getCenterY();

      const stairs = new StairContainer(
        this,
        centerX,
        centerY,
        this.currentPlayer!,
        () => this.handleNextLevel(),
      );

      // 2. REDUCIR HITBOX: Hacemos que el área de colisión sea pequeña
      // y esté en el centro, para que deba pisarla de verdad.
      if (stairs.body) {
        // Ajustamos a un cuadrado pequeño de 8x8 píxeles en el centro
        (stairs.body as Phaser.Physics.Arcade.Body).setSize(4, 4);
        (stairs.body as Phaser.Physics.Arcade.Body).setOffset(2, 2);
      }
      this.markTileAsOccupied(tile.pixelX, tile.pixelY);
    }
  }

  private handleNextLevel() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    // Calculamos el siguiente número
    const nextLevel = this.currentLevel + 1;
    this.sound.play("next_level", { volume: 0.5 });
    // 1. Enviamos el nivel EXPLÍCITO a la máquina
    this.portalService?.send("NEXT_MAP", { level: nextLevel });
    this.portalService?.send("OPEN_CARD_SELECTOR");

    // 2. Pausamos físicas y eventos
    this.physics.pause();
    this.events.off("PLAYER_MOVED");
    this.events.off("UPDATE_ENEMIES");

    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      // 2. Iniciamos la nueva escena con el mismo número
      this.scene.start("deep-dungeon", { level: nextLevel });
    });
  }
  private spawnCrystals(
    type: CrystalType,
    crystalLevel: number,
    count: number,
  ) {
    const lootTable: Record<CrystalType, Record<number, LootConfig>> = {
      pink: {
        1: { pink: 1, white: 0, blue: 0 },
        2: { pink: 2, white: 0, blue: 0 },
        3: { pink: 3, white: 0, blue: 0 },
        4: { pink: 4, white: 0, blue: 0 },
        5: { pink: 5, white: 0, blue: 0 },
      },
      white: {
        1: { pink: 0, white: 1, blue: 0 },
        2: { pink: 0, white: 2, blue: 0 },
        3: { pink: 0, white: 3, blue: 0 },
        4: { pink: 0, white: 4, blue: 0 },
        5: { pink: 0, white: 5, blue: 0 },
      },
      blue: {
        1: { pink: 0, white: 0, blue: 1 },
        2: { pink: 0, white: 0, blue: 2 },
        3: { pink: 0, white: 0, blue: 3 },
        4: { pink: 0, white: 0, blue: 4 },
        5: { pink: 0, white: 0, blue: 5 },
      },
      prismora: {
        1: { pink: 1, white: 0, blue: 0 },
        2: { pink: 1, white: 1, blue: 0 },
        3: { pink: 1, white: 1, blue: 1 },
        4: { pink: 1, white: 2, blue: 1 },
        5: { pink: 1, white: 2, blue: 2 },
      },
    };

    if (!this.groundLayer) return;

    const validTiles = this.groundLayer.filterTiles(
      (tile: Phaser.Tilemaps.Tile) => tile.index !== -1,
    );
    let spawned = 0;

    while (spawned < count && validTiles.length > 0) {
      const tile = Phaser.Utils.Array.GetRandom(
        validTiles,
      ) as Phaser.Tilemaps.Tile;
      const tileKey = `${tile.x},${tile.y}`;

      // Evitar solapar con otros cristales o la escalera
      if (!this.isTileOccupied(tile.pixelX, tile.pixelY)) {
        const cx = tile.getCenterX();
        const cy = tile.getCenterY() - 4; // Tu ajuste de altura

        const crystal = new CrystalContainer(this, cx, cy, type, crystalLevel);
        crystal.on("crystal_destroyed", (data: any) => {
          const dropKey = `${data.type}_crystal_${data.level}`;
          const dropData = CRYSTAL_DROP_TABLE[dropKey];

          if (dropData) {
            const amount = this.calculateWeight(dropData.energyDrops);
            this.spawnEnergyOrb(data.x, data.y, amount);
          }
        });

        this.crystals.push(crystal);
        const player = this.currentPlayer as any;
        // 1. Colisión con el Jugador (Picar)
        this.physics.add.collider(
          player,
          crystal,
          () => {
            if (player.isMining) {
              // Solo restamos vida al cristal, NO enviamos eventos desde aquí
              crystal.takeDamage();
            }
          },
          undefined,
          this,
        );

        this.occupiedTiles.add(tileKey);
        spawned++;
      }
    }
  }
  // 1. Determina cuánta energía soltar basado en probabilidades (pesos)
  private calculateWeight(drops: { amount: number; weight: number }[]): number {
    const totalWeight = drops.reduce((acc, d) => acc + d.weight, 0);
    let random = Math.random() * totalWeight;

    for (const drop of drops) {
      if (random < drop.weight) return drop.amount;
      random -= drop.weight;
    }
    return drops[0].amount;
  }

  // 2. Crea el objeto físico (el rayo) en el mapa
  private spawnEnergyOrb(x: number, y: number, amount: number) {
    let texture = "lightning";
    if (amount >= 5 && amount < 10) texture = "lightning5";
    if (amount >= 10) texture = "lightning10";

    const orb = this.energyOrbsGroup.create(
      x,
      y,
      texture,
    ) as Phaser.Physics.Arcade.Sprite;

    orb.setData("value", amount);

    // 2. Nos aseguramos de que colisione con los bordes
    orb.setCollideWorldBounds(true);

    // --- FIN NUEVO ---

    // Ajuste de Depth para visibilidad (puedes jugar con este valor si usas oscuridad)
    orb.setDepth(100);
  }

  // 3. Acción al colisionar el jugador con la energía
  private collectEnergy(orb: Phaser.Physics.Arcade.Sprite) {
    const value = orb.getData("value");
    this.sound.play("win_energy", { volume: 0.4 });
    this.portalService?.send("ADD_ENERGY", { amount: value });

    // 1. Creamos el texto con un estilo más sólido
    const text = this.add
      .text(orb.x, orb.y - 5, `+${value} Energy`, {
        fontFamily: "monospace",
        fontSize: "6px", // Un pelín más grande ayuda a la nitidez
        color: "#ffff00",
        stroke: "#000000",
        resolution: 10,
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    // 2. EN LUGAR DE setRoundPixels, usamos esto para que no se vea borroso:
    text.setDepth(3000);
    // Esto fuerza a Phaser a renderizar el texto en posiciones enteras (evita el blur)
    text.setAlign("center");

    // 3. ANIMACIÓN MÁS LENTA (1.5 segundos)
    this.tweens.add({
      targets: text,
      y: text.y - 35, // Sube un poco más para que de tiempo a leerlo
      alpha: { from: 1, to: 0 },
      duration: 1000, // Duración lenta y clara
      ease: "Linear", // Movimiento constante para que sea fácil de seguir con el ojo
      onComplete: () => text.destroy(),
    });

    orb.destroy();
  }

  public spawnDamageText(
    x: number,
    y: number,
    damage: number,
    isEnemy: boolean = false,
  ) {
    const text = this.add
      .text(Math.floor(x), Math.floor(y) - 8, `-${damage}`, {
        fontFamily: "monospace",
        fontSize: isEnemy ? "7px" : "6px",
        color: "#ff6666",
        stroke: "#000000",
        strokeThickness: 2,
        resolution: 10,
      })
      .setOrigin(0.5)
      .setDepth(9998);

    this.tweens.add({
      targets: text,
      y: text.y - 18,
      alpha: { from: 1, to: 0 },
      duration: 800,
      ease: "Quad.easeOut",
      onUpdate: () => {
        text.x = Math.round(text.x);
        text.y = Math.round(text.y);
      },
      onComplete: () => text.destroy(),
    });
  }

  public spawnCritText(x: number, y: number, isEnemy: boolean = false) {
    const text = this.add
      .text(Math.floor(x), Math.floor(y) - 10, "CRITICAL!", {
        fontFamily: "monospace",
        fontSize: "8px",
        color: "#ffe000",
        stroke: "#000000",
        strokeThickness: 3,
        resolution: 10,
      })
      .setOrigin(0.5)
      .setDepth(9999);

    this.tweens.add({
      targets: text,
      y: text.y - 20,
      scaleX: { from: 1.4, to: 1 },
      scaleY: { from: 1.4, to: 1 },
      alpha: { from: 1, to: 0 },
      duration: 900,
      ease: "Quad.easeOut",
      onUpdate: () => {
        text.x = Math.round(text.x);
        text.y = Math.round(text.y);
      },
      onComplete: () => text.destroy(),
    });
  }

  public spawnFloatingText(x: number, y: number, message: string) {
    // 1. Forzamos la posición inicial a números enteros (Math.floor)
    const text = this.add
      .text(Math.floor(x), Math.floor(y) - 5, message, {
        fontFamily: "monospace", // Usar una fuente monospace ayuda a la rejilla de píxeles
        fontSize: "6px", // Un tamaño par (16, 20, 24) suele verse mejor
        color: "#ffffff",
        stroke: "#000000",
        resolution: 10,
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    // 2. IMPORTANTE: Subimos mucho el depth para que no lo tape nada
    text.setDepth(9999);

    // 3. LA CLAVE DE LA NITIDEZ: Forzar redondeo en cada frame
    this.tweens.add({
      targets: text,
      y: text.y - 30, // La distancia que sube
      alpha: { from: 1, to: 0 }, // Desaparece suavemente
      duration: 1200, // Duración lenta y legible
      ease: "Linear", // Movimiento constante

      onUpdate: () => {
        text.y = Math.round(text.y);
      },

      onComplete: () => text.destroy(), // Limpiar al terminar
    });
  }
  public handleMining(crystal: CrystalContainer) {
    const stats = this.portalService?.state.context.stats;
    const pickaxes = stats?.inventory.pickaxe || 0;

    if (pickaxes > 0 && !crystal.isBeingMined) {
      crystal.isBeingMined = true;
      this.sound.play("mine_crystal", { volume: 0.5 });
      if (this.currentPlayer) {
        this.currentPlayer.isMining = true;
        this.currentPlayer.mining();
      }

      this.portalService?.send("UPDATE_STATS", {
        stats: { inventory: { ...stats?.inventory, pickaxe: pickaxes - 1 } },
      });

      this.portalService?.send("CRYSTAL_MINED", {
        crystalType: String(crystal.type),
        shapeId: Number(crystal.crystalLevel),
      });

      this.time.delayedCall(800, () => {
        if (this.currentPlayer) {
          this.currentPlayer.isMining = false;
          this.currentPlayer.idle();
        }

        // --- EL CAMBIO ESTÁ AQUÍ ---
        // 1. Emitimos el evento para que salte la energía
        crystal.emit("crystal_destroyed", {
          x: crystal.x,
          y: crystal.y,
          type: crystal.type,
          level: crystal.crystalLevel,
        });

        // 2. Animación de desaparición
        this.tweens.add({
          targets: crystal,
          scale: 0,
          alpha: 0,
          duration: 150,
          onComplete: () => {
            this.crystals = this.crystals.filter((c) => c !== crystal);
            crystal.destroy();
          },
        });
      });
    }
  }
  private isTileOccupied(x: number, y: number): boolean {
    const key = `${Math.floor(x / 16)},${Math.floor(y / 16)}`;
    return this.occupiedTiles.has(key);
  }

  private markTileAsOccupied(x: number, y: number) {
    const key = `${Math.floor(x / 16)},${Math.floor(y / 16)}`;
    this.occupiedTiles.add(key);
  }
  private buildLevel(level: number) {
    //console.log("Construyendo elementos para el nivel:", level);
    // Limpieza lógica
    this.occupiedTiles.clear();
    this.crystals = [];
    this.enemies = []; // <--- Limpia también los enemigos
    this.traps = []; // <--- Limpia también las trampas

    const config = LEVEL_DESIGNS[level] || LEVEL_DESIGNS[1];

    // 3. Generar Salida (Escalera)
    this.spawnStairsRandomly();
    // 2. Picos (Añadido ahora)
    this.spawnPickaxes(config.pickaxes);

    // 4. Generar Enemigos según la constante
    config.enemies.forEach((e) => {
      this.spawnEnemies(e.type, e.count);
    });

    // 5. Generar Trampas según la constante
    this.spawnTraps(config.traps);

    // 6. Generar Cristales según la constante
    config.crystals.forEach((c) => {
      this.spawnCrystals(c.type as CrystalType, c.level, c.count);
    });
  }
  private createFog() {
    const width = this.map.widthInPixels;
    const height = this.map.heightInPixels;
    const radioVisión = 60; // Define el radio aquí para reusarlo

    this.darknessMask = this.add.renderTexture(0, 0, width, height);
    this.darknessMask.setOrigin(0, 0);
    if (
      this.currentLevel === 1 ||
      this.currentLevel === 2 ||
      this.currentLevel === 3 ||
      this.currentLevel === 4 ||
      this.currentLevel === 5 ||
      this.currentLevel === 11 ||
      this.currentLevel === 12 ||
      this.currentLevel === 13 ||
      this.currentLevel === 14 ||
      this.currentLevel === 15
    )
      this.darknessMask.fill(0x191a27, 1);
    else if (
      this.currentLevel === 6 ||
      this.currentLevel === 7 ||
      this.currentLevel === 8 ||
      this.currentLevel === 9 ||
      this.currentLevel === 10 ||
      this.currentLevel === 16 ||
      this.currentLevel === 17 ||
      this.currentLevel === 18 ||
      this.currentLevel === 19 ||
      this.currentLevel === 20
    )
      this.darknessMask.fill(0x271714, 1);
    this.darknessMask.setDepth(2000);
    this.darknessMask.setScrollFactor(1);

    this.visionCircle = this.make.graphics({ x: 0, y: 0 });
    this.visionCircle.fillStyle(0x191a27, 1);

    // IMPORTANTE: Dibujamos el círculo centrado en (0,0)
    // Así, cuando borremos en (x, y), el centro será exactamente (x, y)
    this.visionCircle.fillCircle(0, 0, radioVisión);
  }
  public isNearWater(tileX: number, tileY: number): boolean {
    const waterLayer = this.layers["Water"];
    if (!waterLayer) return false;

    // Revisamos la baldosa actual y las 4 vecinas (arriba, abajo, izquierda, derecha)
    const neighbors = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ];

    return neighbors.some((offset) => {
      const tile = waterLayer.getTileAt(tileX + offset.x, tileY + offset.y);
      return tile !== null; // Si hay un tile de agua cerca, es zona prohibida
    });
  }
  public get isPlaying() {
    return this.portalService?.state.matches("playing") === true;
  }
  public get isReady() {
    return this.portalService?.state.matches("ready") === true;
  }
  public get gameState() {
    return this.registry.get("gameState") as GameState;
  }
  public get score() {
    return this.portalService?.state?.context.score ?? 0;
  }
}
