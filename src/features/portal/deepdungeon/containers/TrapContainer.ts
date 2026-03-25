export class TrapContainer extends Phaser.GameObjects.Container {
  private sprite: Phaser.GameObjects.Sprite;
  private isActivated: boolean = false;
  private animKey: string;

  constructor(scene: Phaser.Scene, x: number, y: number, level: number) {
    super(scene, x, y);

    // 1. Determinar qué sprite usar según el nivel
    const textureKey = level >= 6 && level <= 10 ? "spikes2" : "spikes";
    this.animKey = `${textureKey}_anim`;

    // 2. Crear el sprite con el frame inicial
    this.sprite = scene.add.sprite(0, 0, textureKey, 0);
    this.add(this.sprite);

    // 3. Crear la animación dinámica (se adapta a spikes o spikes2)
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

  public activate() {
    if (this.isActivated) return;
    this.isActivated = true;

    // Usamos la animKey guardada en el constructor
    this.sprite.play(this.animKey);

    this.scene.time.delayedCall(1000, () => {
      if (this.active) {
        this.sprite.setFrame(0);
        this.isActivated = false;
      }
    });
  }
}
