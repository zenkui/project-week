import { AssetManager } from "./assets.js";

const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
const assets = new AssetManager();

function resizeCanvas() {
  const aspectRatio = 1280 / 768;
  let width = window.innerWidth;
  let height = width / aspectRatio;

  if (height > window.innerHeight) {
    height = window.innerHeight;
    width = height * aspectRatio;
  }

  canvas.width = width;
  canvas.height = height;
}
async function startGame() {
  await assets.loadAll([{ name: "map1", src: "img/map-lvl1.png" }]);
  resizeCanvas();
  drawMap();
}

function drawMap() {
  const map = assets.get("map1");
  if (!map) return;
  c.drawImage(map, 0, 0, canvas.width, canvas.height);
}

/*Enemy*/

class Enemy {
  constructor() {
    this.position = {
      x: 0,
      y: 0,
    }
    this.width = 100
    this.height = 100
  }
  draw() {
    c.fillStyle = "red";
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  update() {
    this.draw()
    this.positon.x
  }
}

function animate() {
  requestAnimationFrame(animate);
  c.fillStyle = "red";
  c.fillRect(200, 400, 100, 100);
}
animate();

window.addEventListener("resize", () => {
  resizeCanvas();
  drawMap();
});

startGame();
