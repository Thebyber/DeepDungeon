export class CrystalContainer extends Phaser.GameObjects.Container {
  declare public body: Phaser.Physics.Arcade.Body;
  public isBeingMined: boolean = false;
  private health: number = 1;
  public type: string;
  public crystalLevel: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: string,
    crystalLevel: number,
  ) {
    super(scene, x, y);
    this.type = type;
    this.crystalLevel = crystalLevel;

    const spriteKey = `${type}_crystal_${crystalLevel}`;
    const sprite = scene.add.sprite(0, 0, spriteKey);
    sprite.setOrigin(0.5, 0.5);
    this.add(sprite);

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    if (this.body) {
      this.body.setSize(6, 6);
      this.body.setOffset(-3, -3); // Centrado de la hitbox
      this.body.setImmovable(true);
    }
  }

  public takeDamage(): boolean {
    if (this.health <= 0) return false;

    this.health--;

    // Feedback visual de golpe
    this.scene.tweens.add({
      targets: this,
      scale: 0.8,
      duration: 50,
      yoyo: true,
      ease: "Quad.easeInOut",
    });

    if (this.health <= 0) {
      this.collect();
      return true;
    }
    return false;
  }

  private collect() {
    // --- PASO CLAVE: EMITIR EL EVENTO ANTES DE MORIR ---
    // Esto le dice a DeepDungeonScene: "Oye, me han roto, suelta la energía"
    this.emit("crystal_destroyed", {
      x: this.x,
      y: this.y,
      type: this.type,
      level: this.crystalLevel,
    });

    // Pequeña animación de desaparición antes del destroy
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scale: 0,
      duration: 100,
      onComplete: () => {
        this.destroy();
      },
    });
  }
}
