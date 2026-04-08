import { BumpkinContainer } from "features/world/containers/BumpkinContainer";
import { EnemyType, ENEMY_TYPES, EnemyStats } from "../lib/Enemies";
import { CrystalContainer } from "./CrystalContainer";
import { DROP_ITEMS_CONFIG, DUNGEON_POINTS } from "../DeepDungeonConstants";
import { DeepDungeonScene } from "../DeepDungeonScene";

type DropKey = string;
type DropConfigKey = keyof typeof DROP_ITEMS_CONFIG;

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
  hurt: () => void; // Añadimos la función hurt aquí
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
  private _postUpdateCb!: () => void;
  private attackSound!: Phaser.Sound.BaseSound;
  private attackAoESound?: Phaser.Sound.BaseSound;

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
    // Cargar sonidos de ataque basados en el tipo de enemigo
    const name = this.stats.sprite.toLowerCase();
    this.attackSound = this.scene.sound.add(`${name}_attack`, { volume: 0.2 });
    if (this.stats.damageAoE > 0) {
      this.attackAoESound = this.scene.sound.add(`${name}_attackAoE`, {
        volume: 0.2,
      });
    }
    // 2. CREAR EL SPRITE UNA SOLA VEZ
    // Usamos el nombre base que definiste en Enemies.ts ("skeleton")
    const assetKey = `${name}_idle`;

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
    this._postUpdateCb = () => {
      if (this.healthText) {
        this.healthText.x = Math.round(this.healthText.x);
        this.healthText.y = Math.round(this.healthText.y);
      }
    };
    this.scene.events.on("postupdate", this._postUpdateCb);
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
    const scene = this.scene as unknown as SceneWithEnemies;
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
  public takeDamage(amount: number, isCritical: boolean = false) {
    if (this.isDead || this.isInvulnerable) return;

    // 1. Restar vida
    this.currentHp = Math.max(0, this.currentHp - amount);
    this.isInvulnerable = true;

    // 2. Actualizar barra visual
    this.updateHealthBar(isCritical);

    if (this.currentHp <= 0) {
      this.die();
    } else {
      // 3. Efecto visual de golpe
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
    this.scene.events.off("postupdate", this._postUpdateCb);
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
      enemyName: enemyName.toLowerCase(),
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
    this.addSound("dead_enemies").play();
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
    if (this.isMoving || !this.player || this.isDead) return;

    this.isMoving = true;
    this.setDepth(150);
    this.playAnimationEnemies("attack");

    this.attackSound.play();

    // IMPACTO: A los 500ms (ajusta según el frame de tu animación de golpe)
    this.scene.time.delayedCall(50, () => {
      if (
        !this ||
        !this.active ||
        this.isDead ||
        !this.spriteBody ||
        !this.scene
      )
        return;

      // LLAMADA AL ÁRBITRO: Pasamos el daño base, la escena aplica críticos y tu defensa
      (this.scene as any).handlePlayerDamage(
        this.stats.damage,
        this.stats.criticalChance,
        true,
      );
    });

    // RECUPERACIÓN: El enemigo vuelve a estar listo tras 1 segundo
    this.scene.time.delayedCall(1000, () => {
      if (this.active && !this.isDead) {
        this.setDepth(50);
        this.isMoving = false;
        this.playAnimationEnemies("idle");
      }
    });
  }

  public attackAoEPlayer() {
    if (this.isMoving || !this.player || this.isDead) return;

    this.isMoving = true;
    this.setDepth(150);
    this.playAnimationEnemies("attackAoE");

    this.attackAoESound?.play();

    // IMPACTO AOE
    this.scene.time.delayedCall(50, () => {
      if (
        !this ||
        !this.active ||
        this.isDead ||
        !this.spriteBody ||
        !this.scene
      )
        return;
      // Si el objeto ya no es válido o ha sido destruido, salimos inmediatamente

      // 1. Aplicamos el daño
      (this.scene as any).handlePlayerDamage(
        this.stats.damageAoE,
        this.stats.criticalChance,
        true,
      );

      // 2. COMPROBACIÓN CRÍTICA:
      // Solo llamar a hurt() si el jugador NO ha muerto tras el daño anterior
      const player = this.player as any; // Usamos any para acceder a isDead

      if (player && !player.isDead) {
        if (typeof player.hurt === "function") {
          player.hurt();
        }
      }
    });

    this.scene.time.delayedCall(1000, () => {
      if (this.active && !this.isDead) {
        this.setDepth(50);
        this.isMoving = false;
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

    // 1. Calcular si es crítico
    const isCritical = Math.random() < (this.stats.criticalChance || 0);

    // 2. Calculamos el ataque bruto (bruto = ataque base o ataque x 2 si es crítico)
    const rawAttack = isCritical ? rawDamage * 2 : rawDamage;

    // 3. Restamos la defensa al ataque ya potenciado
    // Esto hace que el crítico sea mucho más valioso contra enemigos acorazados
    const finalDamage = Math.max(1, rawAttack - playerDefense);
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
    const config = DROP_ITEMS_CONFIG[selectedKey as DropConfigKey];
    const playUISound = (fileName: string) => {
      const audio = new Audio(`/world/DeepDungeonAssets/${fileName}.mp3`);
      audio.volume = 0.4;
      audio.play().catch(() => {});
    };
    if (!config || !config.sprite) return;

    const portalService = this.scene.portalService;
    // Creamos el drop directamente en la escena
    const drop = this.scene.physics.add.sprite(this.x, this.y, config.sprite);

    if (drop.body) {
      const body = drop.body as Phaser.Physics.Arcade.Body;
      body.setAllowGravity(false);
      body.setImmovable(true);
      body.setSize(12, 12);
    }

    drop.setDepth(40);

    // Guardamos una referencia local a la escena para el overlap
    const currentScene = this.scene as DeepDungeonScene;

    if (!this.player) return;
    const overlapObj = this.scene.physics.add.overlap(
      this.player,
      drop,
      () => {
        overlapObj.destroy();

        if (
          config.label &&
          typeof currentScene.spawnFloatingText === "function"
        ) {
          currentScene.spawnFloatingText(drop.x, drop.y, config.label);
        }

        if (portalService) {
          playUISound("win_item");
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
