export class TrapContainer extends Phaser.GameObjects.Container {
  private sprite: Phaser.GameObjects.Sprite;
  public isActivated: boolean = false; // Cambiado a public para que la escena pueda leerlo
  private animKey: string;

  constructor(scene: Phaser.Scene, x: number, y: number, level: number) {
    super(scene, x, y);
    const mapIndex = ((level - 1) % 10) + 1;
    const textureKey = mapIndex >= 6 && mapIndex <= 10 ? "spikes2" : "spikes";
    this.animKey = `${textureKey}_anim`;

    this.sprite = scene.add.sprite(0, 0, textureKey, 0);
    this.add(this.sprite);

    if (!scene.anims.exists(this.animKey)) {
      scene.anims.create({
        key: this.animKey,
        frames: scene.anims.generateFrameNumbers(textureKey, {
          start: 0,
          end: 4,
        }),
        frameRate: 15,
        repeat: 0,
      });
    }

    this.setDepth(1);
    scene.add.existing(this);
  }

  /**
   * Intenta activar la trampa.
   * @returns true si la trampa se activó en este momento, false si ya estaba activa.
   */
  public activate(): boolean {
    if (this.isActivated) return false;

    this.isActivated = true;
    this.sprite.play(this.animKey);

    // Sonido de la trampa (opcional)
    // this.scene.sound.play("trap_snap");

    this.scene.time.delayedCall(1000, () => {
      if (this.active) {
        this.sprite.setFrame(0);
        this.isActivated = false;
      }
    });

    return true;
  }
}
