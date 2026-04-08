/* eslint-disable prettier/prettier */
import { BumpkinContainer } from "src/features/world/containers/BumpkinContainer";
import { DeepDungeonScene } from "../DeepDungeonScene";
import { CrystalContainer } from "../containers/CrystalContainer";

interface Enemy {
  x: number;
  y: number;
  active: boolean;
  getCurrentHp(): number;
  takeDamage(damage: number): void;
  attackPlayer(): void;
}

interface SceneWithEnemies extends Phaser.Scene {
  enemies: Enemy[];
  crystals: CrystalContainer[];
  checkTrapsAt(x: number, y: number): void;
  handleMining(crystal: CrystalContainer): void;
  packetSentAt?: number;
  layers: Record<string, Phaser.Tilemaps.TilemapLayer>;
}

export class GridMovement {
  private scene: Phaser.Scene;
  private currentPlayer: BumpkinContainer;
  private tileSize: number;
  private isMoving = false;
  private frozen = false;
  private wasKeyDown = false;
  private layers: Record<string, Phaser.Tilemaps.TilemapLayer>;
  private readonly OFFSET_X = 8;
  private readonly OFFSET_Y = 4;
  private rockHits: Map<string, number> = new Map(); // Para rastrear golpes a rocas específicas

  constructor(
    scene: Phaser.Scene,
    player: BumpkinContainer,
    tileSize: number,
    layers: Record<string, Phaser.Tilemaps.TilemapLayer>,
  ) {
    this.scene = scene;
    this.currentPlayer = player;
    this.tileSize = tileSize;
    this.layers = layers;
  }

  public setFrozen(value: boolean) {
    this.frozen = value;
  }

  public handleInput(cursors: Record<string, { isDown: boolean } | undefined>) {
    // 1. Bloqueos de seguridad existentes
    if (
      this.frozen ||
      this.isMoving ||
      !this.currentPlayer ||
      this.currentPlayer.isDead ||
      !cursors
    )
      return;

    // 2. Detectar si alguna tecla de movimiento está siendo presionada
    const isLeftDown = cursors.left?.isDown || cursors.a?.isDown;
    const isRightDown = cursors.right?.isDown || cursors.d?.isDown;
    const isUpDown = cursors.up?.isDown || cursors.w?.isDown;
    const isDownDown = cursors.down?.isDown || cursors.s?.isDown;

    const isAnyKeyDown = isLeftDown || isRightDown || isUpDown || isDownDown;

    // 3. LA CLAVE: Solo actuar si hay una tecla pulsada Y en el frame anterior NO había ninguna
    if (isAnyKeyDown && !this.wasKeyDown) {
      let dx = 0;
      let dy = 0;

      if (isLeftDown) dx = -this.tileSize;
      else if (isRightDown) dx = this.tileSize;
      else if (isUpDown) dy = -this.tileSize;
      else if (isDownDown) dy = this.tileSize;

      if (dx !== 0 || dy !== 0) {
        this.move(dx, dy);
      }
    }

    // 4. Actualizar el estado para el siguiente frame
    this.wasKeyDown = !!isAnyKeyDown;
  }

  public move(dx: number, dy: number) {
    // --- NUEVO: Acceso al servicio mediante la escena ---
    if (this.isMoving || this.frozen) return;
    if ((this.currentPlayer as any).isDead) return;

    const scene = this.scene as DeepDungeonScene;
    const service = scene.portalService;
    const stats = service?.state.context.stats;

    if (!stats || stats.energy <= 0) {
      if (!this.currentPlayer.isDead) {
        // Esto asegura que si intentas moverte sin energía, mueras visualmente
        (this.scene as any).handlePlayerDeath();
      }
      return;
    }

    // 1. Obtener posición base (sin offsets)
    const currentGridX = Math.floor(this.currentPlayer.x / 16) * 16;
    const currentGridY = Math.floor(this.currentPlayer.y / 16) * 16;

    // 2. Calcular destino
    const nextGridX = currentGridX + dx;
    const nextGridY = currentGridY + dy;

    //console.log(`Intentando mover a: ${nextGridX}, ${nextGridY}`);

    // 3. COMPROBAR COLISIÓN (Paredes)
    const isWall = this.checkCollision(nextGridX, nextGridY);
    if (isWall) {
      //console.log("MOVIMIENTO CANCELADO: Hay una pared.");
      return;
    }
    //Comprobamos si hay agua
    const waterLayer = (
      this.scene as Phaser.Scene & {
        layers: Record<string, Phaser.Tilemaps.TilemapLayer>;
      }
    ).layers["Water"];
    // Usamos +8 y +8 para mirar el centro del tile
    const isWater =
      waterLayer?.getTileAtWorldXY(nextGridX + 8, nextGridY + 8) !== null;
    if (isWater) {
      this.currentPlayer.isSwimming = true;
      // Activa animación de nadar
    } else {
      this.currentPlayer.isSwimming = false;
    }

    // 2. COMPROBAR CRISTALES (Bloqueo y Minado)

    // Usamos Array.isArray para estar 100% seguros antes de llamar a .find()
    const crystals = Array.isArray(scene.crystals) ? scene.crystals : [];

    const targetCrystal = crystals.find(
      (c) =>
        c.active &&
        Math.floor(c.x / 16) * 16 === nextGridX &&
        Math.floor(c.y / 16) * 16 === nextGridY,
    );

    if (targetCrystal) {
      // Llamamos a la lógica de minado de la escena
      // (Debemos castear a la escena real para que TS reconozca handleMining)
      scene.handleMining(targetCrystal);

      // BLOQUEAMOS EL MOVIMIENTO: No dejamos que haga el tween
      return;
    }
    // 4. COMPROBAR ENEMIGOS Y ATACAR
    const enemies = (this.scene as SceneWithEnemies).enemies || [];

    // Buscamos si hay un enemigo específico en la celda de destino
    const targetEnemy = enemies.find(
      (e: Enemy) =>
        Math.floor(e.x / 16) * 16 === nextGridX &&
        Math.floor(e.y / 16) * 16 === nextGridY,
    );

    if (targetEnemy) {
      const player = this.currentPlayer;
      if (player.isAttacking || player.isHurting) {
        //console.log("Acción bloqueada: Jugador ocupado");

        return;
      }
      player.attack();

      // Aplicamos el daño calculado
      (this.scene as any).handleEnemyDamage(targetEnemy);
      // 4. Contraataque enemigo con ligero delay
      this.scene.time.delayedCall(800, () => {
        // Comprobamos active (Phaser) y currentHp (tu lógica)
        if (
          targetEnemy &&
          targetEnemy.active &&
          targetEnemy.getCurrentHp() > 0
        ) {
          // El enemigo decide cómo atacarte (animación + resta de energía interna)
          targetEnemy.attackPlayer();
          // El jugador solo reproduce su animación visual de dolor si sigue vivo
          if (!player.isDead) player.hurt();
        }
      });
      return;
    }

    // 5. SI PASA TODO, MOVER
    this.isMoving = true;

    // ✅ Llamamos a la escena: Ella resta 1, mira tu defensa (si aplica)
    // y decide si mueres o no.
    (this.scene as any).handlePlayerDamage(1);
    if (this.currentPlayer.isDead) return;
    if (dx < 0) {
      this.currentPlayer.faceLeft();
    } else if (dx > 0) {
      this.currentPlayer.faceRight();
    }

    if (isWater) {
      //console.log("estoy en el agua");
      this.currentPlayer.swimming(); // Activa animación de nadar
    } else {
      this.currentPlayer.walk();
    }
    this.scene.tweens.add({
      targets: this.currentPlayer,
      x: nextGridX + this.OFFSET_X,
      y: nextGridY + this.OFFSET_Y,
      duration: 200,
      ease: "Linear",
      onComplete: () => {
        this.isMoving = false;
        // Enviamos la posición X e Y tal cual las tiene el contenedor
        (this.scene as SceneWithEnemies).checkTrapsAt(
          this.currentPlayer.x,
          this.currentPlayer.y,
        );
        // Sincronización MMO Sunflower Land (opcional según tu base)
        if ((this.scene as SceneWithEnemies).packetSentAt !== undefined) {
          (this.scene as SceneWithEnemies).packetSentAt = 0;
        }
        this.scene.events.emit("PLAYER_MOVED");
      },
      // ESTA ES LA CLAVE: Si el tween se detiene por un golpe o interrupción
      onStop: () => {
        this.isMoving = false;
      },
    });
  }

  private checkCollision(gridX: number, gridY: number): boolean {
    const wallLayer = this.layers["Wall"];
    // DIBUJA UN PUNTO TEMPORAL PARA VER DÓNDE BUSCA
    //this.scene.add.circle(gridX + 8, gridY + 4, 2, 0x00ff00).setDepth(2000);
    const tile = wallLayer.getTileAtWorldXY(gridX + 8, gridY + 4);
    return tile !== null;
  }
}
