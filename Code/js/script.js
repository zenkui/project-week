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
    this.waypointIndex = 0
  }
  draw() {
    c.fillStyle = "red";
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  update() {
   
    this.draw();
    
    const waypoint = waypoints[this.waypointIndex]
    const yDistance = waypoint.y - this.position.y
    const xDistance = waypoint.x - this.position.x
    const angle = Math.atan2(yDistance, xDistance)
    this.position.x += Math.cos(angle)
    this.position.y += Math.sin(angle)

    if (
      Math.round(this.position.x) === Math.round(waypoint.x) &&
      Math.round(this.position.y) === Math.round(waypoint.y) &&
      this.waypointIndex < waypoints.length - 1
    ) {
      this.waypointIndex++
    }

  }
}

const enemy = new Enemy({position : { x: waypoints[0].x, y: waypoints[0].y } });
const enemy2 = new Enemy({position : { x: waypoints[0].x -150, y: waypoints[0].y } });


function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, canvas.width, canvas.height); 
  drawMap(); 
  enemy.update(); 
  enemy2.update();
}


window.addEventListener("resize", () => {
  resizeCanvas();
  drawMap();
});

startBtn.addEventListener("click", () => {
  menu.style.display = "none"; 
  startGame(); 
});


