import { BumpkinContainer } from "src/features/world/containers/BumpkinContainer";

export class GridMovement {
  private scene: Phaser.Scene;
  private currentPlayer: BumpkinContainer;
  private tileSize: number;
  private isMoving = false;
  private layers: Record<string, Phaser.Tilemaps.TilemapLayer>;

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

  // Usamos un tipo genérico para cursors que acepte lo que sea, pero sin usar 'any' directamente
  public handleInput(cursors: Record<string, { isDown: boolean } | undefined>) {
    if (this.isMoving || !this.currentPlayer || !cursors) return;

    let dx = 0;
    let dy = 0;

    if (cursors.left?.isDown || cursors.a?.isDown) dx = -this.tileSize;
    else if (cursors.right?.isDown || cursors.d?.isDown) dx = this.tileSize;
    else if (cursors.up?.isDown || cursors.w?.isDown) dy = -this.tileSize;
    else if (cursors.down?.isDown || cursors.s?.isDown) dy = this.tileSize;

    if (dx !== 0 || dy !== 0) {
      this.move(dx, dy);
    }
  }

  private move(dx: number, dy: number) {
    const targetX = this.currentPlayer.x + dx;
    const targetY = this.currentPlayer.y + dy;

    if (this.checkCollision(targetX, targetY)) return;

    this.isMoving = true;

    this.scene.tweens.add({
      targets: this.currentPlayer,
      x: targetX,
      y: targetY,
      duration: 150,
      ease: "Linear",
      onComplete: () => {
        this.isMoving = false;
        // Sincronización con el sistema MMO de Sunflower Land
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this.scene as any).packetSentAt = 0;
      },
    });
  }

  private checkCollision(x: number, y: number): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map = (this.scene as any).map;
    if (
      map &&
      (x < 0 || y < 0 || x >= map.widthInPixels || y >= map.heightInPixels)
    ) {
      return true;
    }

    const wallLayer = this.layers["Wall"];
    if (!wallLayer) return false;

    return wallLayer.getTileAtWorldXY(x, y) !== null;
  }
}
