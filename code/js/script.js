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

let gameStarted = false;

async function startGame() {
  await assets.loadAll([{ name: "map1", src: "img/map-lvl1.png" }]);
  resizeCanvas();
  animate();
}

function drawMap() {
  const map = assets.get("map1");
  if (!map) return;
  c.drawImage(map, 0, 0, canvas.width, canvas.height);
}

/* Enemy */
class Enemy {
  constructor({position = { x: 0, y: 0 } }) {
    this.position = position
    this.width = 100;
    this.height = 100;
  }
  draw() {
    c.fillStyle = "red";
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  update() {
    this.position.x += 1;
    this.draw();
  }
}

const enemy = new Enemy({position : { x: 200, y: 400 } });
const enemy2 = new Enemy({position : { x: 0, y: 400 } });

function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, canvas.width, canvas.height); // canvas temizle
  drawMap(); // haritayı çiz
  enemy.update(); // düşmanı güncelle ve çiz
  enemy2.update();
}

// Pencere boyutu değişirse yeniden çiz
window.addEventListener("resize", () => {
  resizeCanvas();
  drawMap();
});

startBtn.addEventListener("click", () => {
  menu.style.display = "none"; // menüyü gizle
  startGame(); // oyunu başlat
});


