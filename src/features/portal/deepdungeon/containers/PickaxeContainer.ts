import { BumpkinContainer } from "features/world/containers/BumpkinContainer";
import { DeepDungeonScene } from "../DeepDungeonScene"; // Ajusta a tu escena

interface Props {
  x: number;
  y: number;
  scene: DeepDungeonScene;
  player: BumpkinContainer;
}

export class PickaxeContainer extends Phaser.GameObjects.Container {
  private player: BumpkinContainer;
  private sprite: Phaser.GameObjects.Sprite;
  public scene: DeepDungeonScene;
  private isCollected: boolean = false;

  constructor({ x, y, scene, player }: Props) {
    super(scene, x, y);
    this.scene = scene;
    this.player = player;

    // 1. Sprite del pico (centrado en el container)
    this.sprite = scene.add.sprite(0, 0, "pickaxe_sprite").setOrigin(0.5);
    this.add(this.sprite);

    // 2. Física
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;

    body
      .setSize(16, 16) // Tamaño de colisión
      .setImmovable(true);
    body.setOffset(-8, -8);
    // 3. Animación de "levitación" para que se vea recolectable
    scene.tweens.add({
      targets: this.sprite,
      y: -4,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // 4. Configurar el Overlap
    this.createOverlaps();

    // 5. Añadir a la escena
    scene.add.existing(this);
    this.setDepth(y);
  }

  private createOverlaps() {
    this.scene.physics.add.overlap(this.player, this, () => this.collect());
  }

  private collect() {
    if (this.isCollected) return;
    this.isCollected = true;

    // 1. Lógica global (para el HUD y persistencia)
    this.scene.portalService?.send("PICKAXE_FOUND", { amount: 1 });

    // 2. Lógica local (para que la escena de Phaser se entere INSTANTÁNEAMENTE)
    // Accedemos a las stats del objeto player que pasamos por Props

    this.destroy();
  }
}
