import { BumpkinContainer } from "features/world/containers/BumpkinContainer";
import { EnemyType, ENEMY_TYPES, EnemyStats } from "../lib/Enemies";
import { CrystalContainer } from "./CrystalContainer";
import { DROP_ITEMS_CONFIG, DUNGEON_POINTS } from "../DeepDungeonConstants";
import { DeepDungeonScene } from "../DeepDungeonScene";

interface Props {
  x: number;
  y: number;
  scene: Phaser.Scene;
  player?: BumpkinContainer;
  type: EnemyType;
}

interface SceneWithTraps extends Phaser.Scene {
  checkTrapsAt?: (x: number, y: number) => void;
}

interface SceneWithEnemies extends Phaser.Scene {
  enemies?: EnemyContainer[];
}

interface SceneWithLayers extends Phaser.Scene {
  layers?: Record<string, Phaser.Tilemaps.TilemapLayer>;
}

interface IPlayerContainer extends BumpkinContainer {
  playAnimationEnemies(state: string): void;
}

export class EnemyContainer extends Phaser.GameObjects.Container {
  private player?: BumpkinContainer;
  public scene: DeepDungeonScene;
  public spriteBody: Phaser.GameObjects.Sprite;
  public enemyType: EnemyType;
  private isMoving = false;
  private tileSize = 16;
  public stats: EnemyStats;
  public currentHp: number;
  public trapDamage: number;
  private directionFacing: "left" | "right" = "right";
  public instanceId: string; // Único para este esqueleto concreto
  public targetGridX?: number;
  public targetGridY?: number;
  public nextGridX?: number;
  public nextGridY?: number;
  private healthText: Phaser.GameObjects.Text;
  private heartIcon: Phaser.GameObjects.Image;
  private isInvulnerable: boolean = false;
  private isDead = false;
  private nameText: Phaser.GameObjects.Text;

  constructor({ x, y, scene, player, type }: Props) {
    super(scene, x, y);
    this.instanceId = Phaser.Utils.String.UUID(); // Genera algo como "abc-123"
    this.scene = scene as DeepDungeonScene;
    this.player = player;
    this.enemyType = type;
    // Inicializamos con la posición actual para no bloquear el 0,0
    this.nextGridX = Math.floor(x / 16) * 16;
    this.nextGridY = Math.floor(y / 16) * 16;
    // 1. Cargar estadísticas una sola vez
    this.stats = ENEMY_TYPES[this.enemyType];
    this.currentHp = this.stats.hp; // Aquí debería ser 2 según tu Enemies.ts
    this.trapDamage = this.stats.trapDamage ?? 2; // Si no existe, 2 por defecto
    // 2. CREAR EL SPRITE UNA SOLA VEZ
    // Usamos el nombre base que definiste en Enemies.ts ("skeleton")
    const assetKey = `${this.stats.sprite.toLowerCase()}_idle`;

    this.spriteBody = this.scene.add.sprite(0, 0, assetKey);
    this.spriteBody.setOrigin(0.5, 0.5);

    // Ajuste de altura para que los pies toquen el suelo (opcional)
    this.spriteBody.setY(-4);
    this.add(this.spriteBody);
    this.setDepth(50);

    // 3. Iniciar animación
    this.playAnimationEnemies("idle");
    this.scene.add.existing(this);
    // Asegúrate de que tenga físicas si usas overlaps
    this.scene.physics.add.existing(this);

    this.nameText = this.scene.add
      .text(0, -27, this.stats.name.toUpperCase(), {
        fontSize: "4.5px",
        fontFamily: "monospace", // O la fuente que uses en tu juego
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 2,
        resolution: 10,
        align: "center",
      })
      .setOrigin(0.5);

    // Lo añadimos al contenedor para que se mueva con el enemigo

    // 1. Crear el Texto de vida (A la IZQUIERDA: x = -6)
    this.healthText = new Phaser.GameObjects.Text(
      this.scene,
      -3,
      -20,
      `${this.currentHp}`,
      {
        fontSize: "7px", // Un poco más grande para que se lea mejor
        fontFamily: "monospace",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 2,
        resolution: 2, // Mejora la nitidez en pantallas de alta densidad
      },
    ).setOrigin(0.5);
    this.healthText.setAlign("center");
    this.scene.events.on("postupdate", () => {
      if (this.healthText) {
        this.healthText.x = Math.round(this.healthText.x);
        this.healthText.y = Math.round(this.healthText.y);
      }
    });
    // 2. Crear el Icono de corazón (A la DERECHA: x = 8)
    this.heartIcon = new Phaser.GameObjects.Image(
      this.scene,
      5,
      -20,
      "heart_icon",
    );
    this.heartIcon.setDisplaySize(6, 6); // Un poco más grande para que coincida con el texto

    // 3. Añadirlos al contenedor
    // this.add(this.nameText);
    this.add([this.healthText, this.heartIcon]);
    this.healthText.setDepth(1000);
    this.heartIcon.setDepth(1000);
    this.updateHealthBar();
  }

  private addSound(
    key: string,
    loop = false,
    volume = 0.2,
  ): Phaser.Sound.BaseSound {
    return this.scene.sound.add(key, { loop, volume });
  }

  public playAnimationEnemies(
    state: "idle" | "walk" | "attack" | "hurt" | "attackAoE" | "axe" | "dead",
  ) {
    const name = this.enemyType.toLowerCase(); // "skeleton"
    const key = `${name}_${state}_anim`;
    let end_sprite = 7;
    const frame = 10;
    if (state === "idle") end_sprite = 8;
    else if (state === "attack" || state === "attackAoE") end_sprite = 9;
    else if (state === "dead") end_sprite = 12;

    if (!this.scene.anims.exists(key)) {
      this.scene.anims.create({
        key: key,
        frames: this.scene.anims.generateFrameNumbers(`${name}_${state}`, {
          start: 0,
          end: end_sprite,
        }),
        frameRate: frame, // Un poco más rápido para que el combate sea ágil
        repeat: state === "idle" || state === "walk" ? -1 : 0,
      });
    }
    this.spriteBody.play(key, true);
  }

  public updateMovement() {
    if (!this.player || this.isMoving || this.currentHp <= 0) return;

    const curX = Math.floor(this.x / 16) * 16;
    const curY = Math.floor(this.y / 16) * 16;
    const pX = Math.floor(this.player.x / 16) * 16;
    const pY = Math.floor(this.player.y / 16) * 16;
    const diffX = Math.abs(pX - curX);
    const diffY = Math.abs(pY - curY);
    //console.log(`YO: ${curX},${curY} | PLAYER: ${pX},${pY} | DIFF: ${diffX},${diffY}`,);
    const isNeighbor = diffX <= 16 && diffY <= 16;
    const isNeighbor2 = diffX <= 32 && diffY <= 32;

    if (
      (isNeighbor && (diffX > 0 || diffY > 0)) ||
      (isNeighbor2 && (diffX > 0 || diffY > 0))
    ) {
      // (diffX > 0 || diffY > 0) evita que se pegue a sí mismo
      //console.log("Hola vecino");
      if (isNeighbor2 && this.stats.isAggressive && this.stats.isRanged) {
        // Solo llamamos a la función, ella se encarga del resto
        this.attackAoEPlayer();
        return;
      } else if (isNeighbor && this.stats.isAggressive) {
        // Solo llamamos a la función, ella se encarga del resto
        this.attackAoEPlayer();
        return;
      }
    }
    // Calculamos la dirección hacia el jugador
    let dx = 0,
      dy = 0;
    if (Math.abs(pX - curX) > Math.abs(pY - curY)) dx = pX > curX ? 16 : -16;
    else dy = pY > curY ? 16 : -16;

    const targetX = curX + dx;
    const targetY = curY + dy;

    // --- DEBUG: Descomenta esto para ver las distancias en consola ---
    //console.log(`Distancia a jugador: X:${diffX} Y:${diffY}`);

    // --- 2. EVITAR SOLAPAMIENTO (RESERVA) ---
    const scene = this.scene as SceneWithEnemies;
    const enemies = scene.enemies || [];

    const isReserved = enemies.some((other) => {
      if (other.instanceId === this.instanceId) return false;
      // Si alguien ya va a esa casilla o está parado ahí, me detengo
      return other.nextGridX === targetX && other.nextGridY === targetY;
    });

    if (isReserved) return;
    // ---------------------------------------

    // Lógica de cristales, muros y agua (tu código actual...)
    const sceneWithCrystals = this.scene as { crystals?: CrystalContainer[] };
    const crystals = sceneWithCrystals.crystals || [];
    const hasCrystal = crystals.some((crystal) => {
      const crystalGridX = Math.floor(crystal.x / 16) * 16;
      const crystalGridY = Math.floor(crystal.y / 16) * 16;
      return crystalGridX === targetX && crystalGridY === targetY;
    });

    const sceneWithLayers = this.scene as SceneWithLayers;
    const layers = sceneWithLayers.layers;
    const hasWall =
      layers?.["Wall"]?.getTileAtWorldXY(targetX, targetY) !== null;
    const hasWater =
      layers?.["Water"]?.getTileAtWorldXY(targetX, targetY) !== null;

    if (
      hasWall ||
      hasWater ||
      hasCrystal ||
      (targetX === pX && targetY === pY)
    ) {
      return;
    }

    this.nextGridX = targetX;
    this.nextGridY = targetY;
    this.move(dx, dy);
  }

  private checkTileCollision(x: number, y: number): boolean {
    const wallLayer = (
      this.scene as Phaser.Scene & {
        layers: Record<string, Phaser.Tilemaps.TilemapLayer>;
      }
    ).layers["Wall"];
    return wallLayer
      ? wallLayer.getTileAtWorldXY(x + 1, y + 1) !== null
      : false;
  }

  private move(dx: number, dy: number) {
    this.isMoving = true;
    this.facePlayer();
    this.playAnimationEnemies("walk");

    this.scene.tweens.add({
      targets: this,
      x: this.x + dx,
      y: this.y + dy,
      duration: 200,
      ease: "Linear",
      onComplete: () => {
        this.isMoving = false;

        // LIMPIAMOS LA RESERVA: Ahora nuestra posición real es la del destino
        this.targetGridX = Math.round(this.x / 16) * 16;
        this.targetGridY = Math.round(this.y / 16) * 16;

        const checkX = Math.round(this.x);
        const checkY = Math.round(this.y);

        const sceneWithTraps = this.scene as SceneWithTraps;
        if (sceneWithTraps.checkTrapsAt) {
          sceneWithTraps.checkTrapsAt(checkX, checkY);
        }
        this.playAnimationEnemies("idle");
      },
    });
  }
  // El enemigo recibe daño
  // 1. FUNCIÓN DE DAÑO UNIFICADA
  public takeDamage(trapDamage?: number) {
    // 1. SI ES INVULNERABLE O YA MURIÓ, SALIMOS
    if (this.currentHp <= 0 || this.isInvulnerable) return;

    let finalDamage: number = 0;
    let isCritical = false;

    // Accedemos a las stats reales desde la máquina
    const stats = this.scene.portalService?.state.context.stats;

    if (trapDamage !== undefined) {
      finalDamage = trapDamage;
    } else if (stats) {
      const roll = Math.random();
      isCritical = roll < (stats.criticalChance || 0.05);
      const multiplier = isCritical ? 2 : 1;

      const pAttack = Number(stats.attack) || 1;
      const eDefense = Number(this.stats.defense) || 0;

      finalDamage = pAttack * multiplier - eDefense;
      if (finalDamage < 1 || isNaN(finalDamage)) finalDamage = 1;
    }

    // 2. APLICAR DAÑO E INICIAR INVULNERABILIDAD
    this.currentHp -= finalDamage;
    this.isInvulnerable = true; // Activamos el escudo
    this.updateHealthBar(isCritical);

    //console.log(`[COMBATE] Daño: ${finalDamage} | HP: ${this.currentHp}`);

    if (this.currentHp <= 0) {
      this.currentHp = 0;
      this.die();
    } else {
      // Feedback visual de golpe (se mantiene igual)
      this.spriteBody.setTint(isCritical ? 0xffff00 : 0xff0000);
      this.playAnimationEnemies("hurt");
      this.scene.time.delayedCall(500, () => {
        if (this.active) {
          this.isInvulnerable = false;
          this.spriteBody.clearTint();
          this.playAnimationEnemies("idle");
        }
      });
    }
  }
  private die() {
    // 1. BLOQUEO DE SEGURIDAD (EL MÁS IMPORTANTE)
    // Si ya está muerto, salimos inmediatamente para no repetir procesos
    if (this.isDead) return;
    this.isDead = true;

    // 2. DESACTIVAR FÍSICAS E INTERACCIÓN INMEDIATAMENTE
    this.disableInteractive();
    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).setEnable(false);
    }

    // 3. NOTIFICAR A LA MÁQUINA (UNA SOLA VEZ)
    // Usamos el nombre de los stats o el tipo, pasado a minúsculas
    const enemyName = this.enemyType || this.stats?.name || "unknown";
    const points = DUNGEON_POINTS.ENEMIES[enemyName] || 200;

    //console.log("Murió el enemigo:", enemyName);

    this.scene.portalService?.send("ENEMY_KILLED", {
      enemyType: enemyName.toLowerCase(),
    });

    // 3. ENVIAR PUNTOS
    this.scene.portalService?.send("ADD_POINTS", { amount: points });

    // 4. LÓGICA DE DROP (Mantenemos tu lógica igual)
    const stats = this.stats;
    if (Math.random() <= (stats.dropChance || 0)) {
      const lootTable = stats.lootTable;
      if (lootTable && lootTable.length > 0) {
        const totalWeight = lootTable.reduce(
          (sum, item) => sum + item.weight,
          0,
        );
        let random = Math.random() * totalWeight;
        let selectedKey: DropKey | undefined;

        for (const item of lootTable) {
          if (random < item.weight) {
            selectedKey = item.key;
            break;
          }
          random -= item.weight;
        }

        if (selectedKey) {
          this.spawnDrop(selectedKey);
        }
      }
    }

    // 5. LIMPIEZA VISUAL Y ANIMACIÓN
    this.isMoving = true;
    this.isInvulnerable = true;
    this.currentHp = 0;

    this.healthText?.destroy();
    this.heartIcon?.destroy();
    this.nameText?.destroy();

    this.spriteBody.clearTint();
    this.playAnimationEnemies("dead");

    // 6. LIMPIEZA DE LISTAS EN LA ESCENA
    this.scene.time.delayedCall(100, () => {
      if (this.scene.enemies) {
        this.scene.enemies = this.scene.enemies.filter(
          (e) => e.instanceId !== this.instanceId,
        );
      }
    });

    // 7. DESTRUCCIÓN FINAL
    // (HE ELIMINADO EL SEGUNDO SEND QUE TENÍAS AQUÍ)
    this.scene.time.delayedCall(1310, () => {
      this.destroy();
      this.player?.idle();
    });
  }
  // El enemigo te ataca
  public attackPlayer() {
    if (this.isMoving || !this.player || this.currentHp <= 0) return;

    this.isMoving = true;
    this.setDepth(150);
    this.playAnimationEnemies("attack");
    const name = this.enemyType.toLowerCase(); // "skeleton"
    const EnemyAttackSound = `${name}_attack`;
    this.addSound(EnemyAttackSound).play();
    this.scene.time.delayedCall(1000, () => {
      if (!this.active || this.currentHp <= 0) return;

      // --- CAMBIO AQUÍ: Calculamos el daño con defensa ---
      const damageToApply = this.calculateDamageToPlayer(this.stats.damage);
      // --- USAR PORTAL SERVICE PARA RECIBIR DAÑO ---
      this.scene.portalService?.send("HIT_TRAP", { damage: damageToApply });

      const player = this.player as unknown as IPlayerContainer;
      if (player && player.playAnimationEnemies) {
        player.playAnimationEnemies("hurt");
      }
    });

    this.scene.time.delayedCall(1000, () => {
      if (this.active && this.currentHp > 0) {
        this.setDepth(50);
        this.isMoving = false;
        this.playAnimationEnemies("idle");
      }
    });
  }

  public attackAoEPlayer() {
    // 1. Añadimos un chequeo de HP y estado para evitar re-entrada
    if (this.isMoving || !this.player || this.currentHp <= 0) return;

    this.isMoving = true;
    this.setDepth(150);
    this.playAnimationEnemies("attackAoE");

    const name = this.enemyType.toLowerCase();
    const EnemyAttackSoundAoE = `${name}_attackAoE`;
    this.addSound(EnemyAttackSoundAoE).play();

    // 2. EL DAÑO: Se ejecuta a los 1000ms (impacto visual)
    this.scene.time.delayedCall(50, () => {
      if (!this.active || this.currentHp <= 0) return;

      const damageToApplyAoE = this.calculateDamageToPlayer(
        this.stats.damageAoE,
      );
      this.scene.portalService?.send("HIT_TRAP", { damage: damageToApplyAoE });

      // Solo llamar a hurt() si el jugador no está ya en ese estado
      if (this.player && (this.player as any).hurt) {
        (this.player as any).hurt();
      }
    });

    // 3. LA RECUPERACIÓN: Le damos un poco más de tiempo (1200ms)
    // para que la animación termine y el jugador pueda reaccionar
    this.scene.time.delayedCall(1100, () => {
      if (this.active && this.currentHp > 0) {
        this.setDepth(50);
        this.isMoving = false; // Aquí permitimos que el enemigo vuelva a pensar
        this.playAnimationEnemies("idle");
      }
    });
  }
  private facePlayer() {
    if (!this.player) return;

    // Calculamos si el jugador está a la izquierda o derecha del enemigo
    const isPlayerToLeft = this.player.x < this.x;

    // 1. Actualizamos la propiedad lógica (opcional para lógica interna)
    this.directionFacing = isPlayerToLeft ? "left" : "right";

    // 2. Aplicamos el cambio visual al sprite
    // Si tu sprite por defecto mira a la derecha, flipX true lo hará mirar a la izquierda
    if (this.spriteBody) {
      this.spriteBody.setFlipX(isPlayerToLeft);
    }
  }
  public getCurrentHp() {
    return this.currentHp;
  }

  public updateHealthBar(isCrit: boolean = false) {
    if (this.healthText && this.heartIcon) {
      const current = Math.ceil(this.currentHp);
      this.healthText.setText(`${current}`);

      // Animación de "salto" del número
      this.scene.tweens.add({
        targets: [this.healthText, this.heartIcon],
        scale: isCrit ? 1.8 : 1.2, // Más grande si es crítico
        duration: 100,
        delay: 350,
        yoyo: true,
        ease: "Back.easeOut",
      });

      // Lógica de colores por porcentaje (lo que ya tenías)
      const percentage = current / this.stats.hp;
      if (percentage <= 0.2) this.healthText.setColor("#ff0000");
      else if (percentage <= 0.5) this.healthText.setColor("#ffff00");
      else this.healthText.setColor("#00ff00");

      // Visibilidad
      const isAlive = current > 0;
      this.healthText.setVisible(isAlive);
      this.heartIcon.setVisible(isAlive);
    }
  }
  private calculateDamageToPlayer(rawDamage: number): number {
    const stats = this.scene.portalService?.state.context.stats;
    const playerDefense = stats?.defense || 0;
    const finalDamage = rawDamage - playerDefense;

    //console.log(`--- 🛡️ JUGADOR RECIBE GOLPE ---`);
    //console.log(`> Daño Base Enemigo: ${rawDamage}`);
    //console.log(`> Tu Defensa: ${playerDefense}`);
    //console.log(`> Energía restada: ${finalDamage}`);
    return Math.max(1, finalDamage);
  }
  public takeTrapDamage(amount: number) {
    // 1. Si ya está muerto o procesando otro daño, salimos
    if (this.currentHp <= 0 || this.isMoving) return;

    // 2. Bloqueamos movimiento para que la animación se vea
    this.isMoving = true;

    // 3. Aplicar el daño (las trampas suelen ser daño puro, ignoran defensa)
    this.currentHp -= amount;

    // 4. Actualizar visualmente la barra de vida
    this.updateHealthBar(false); // No es crítico

    // 5. Feedback Visual y Animación
    this.playAnimationEnemies("hurt");

    // 6. Manejar el final del golpe (Tu lógica de eventos)
    this.spriteBody.once(
      "animationcomplete-" + `${this.enemyType.toLowerCase()}_hurt_anim`,
      () => {
        this.spriteBody.clearTint();

        if (this.currentHp <= 0) {
          // ESTO ES LO QUE FALTA: Ejecuta la limpieza y destrucción
          this.die();
        } else {
          this.isMoving = false;
          this.playAnimationEnemies("idle");
        }
      },
    );

    // Seguridad: Si la animación falla, recuperamos el estado a los 500ms
    this.scene.time.delayedCall(500, () => {
      if (this.currentHp > 0 && this.isMoving) {
        this.spriteBody.clearTint();
        this.isMoving = false;
        this.playAnimationEnemies("idle");
      }
    });
  }
  private spawnDrop(selectedKey: DropKey) {
    const config = DROP_ITEMS_CONFIG[selectedKey];
    if (!config || !config.sprite) return;

    const portalService = this.scene.portalService;
    const drop = this.scene.physics.add.sprite(this.x, this.y, config.sprite);

    if (drop.body) {
      const body = drop.body as Phaser.Physics.Arcade.Body;
      body.setAllowGravity(false);
      body.setImmovable(true);
      body.setSize(12, 12);
    }

    drop.setDepth(40);

    //console.log(`📦 Drop generado: ${selectedKey}`);

    this.scene.physics.add.overlap(
      this.player!,
      drop,
      () => {
        //console.log(`%c¡ITEM RECOGIDO! ID: ${selectedKey}`, "color: #bada55; font-weight: bold");

        if (portalService) {
          // --- EL CAMBIO CLAVE ---
          // Enviamos el evento correcto a la máquina
          portalService.send("ITEM_COLLECTED", {
            itemKey: selectedKey,
          });
        }

        drop.destroy();
      },
      undefined,
      this,
    );
  }
}
