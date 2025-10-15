import { AssetManager } from "./assets.js";

const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
const assets = new AssetManager();

const BASE_WIDTH = 1280;
const BASE_HEIGHT = 768;

let scaledWaypoints = [];


 
 
 const placementTilesData2D = []
 
for (let i = 0; i < placementTilesData.length; i+= 20){
  placementTilesData2D.push(placementTilesData.slice(i, i + 20))
}
class placementTile {
  constructor({ position = {x: 0, y:0} }) {
    this.position = position
    this.size = 64
    this.color ='rgba(255,255,255,0.15)'
  }  
 
 
draw() {
  c.fillStyle = this.color
  c.fillRect(this.position.x, this.position.y, this.size, this.size)
 
}
update(mouse) {
  this.draw()
 
  if (
    mouse.x >this.position.x &&
     mouse.x < this.position.x + this.size &&
     mouse.y > this.position.y &&
      mouse.y < this.position.y + this.size)
{console.log('colliding')
  this.color = ' white'
  } else this.color = 'rgba(255,255,255,0.15)'
  }
}
 
const placementtile = []
 
placementTilesData2D.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if( symbol ===14) {
 
      placementTilesData2D.push(
        new placementTile({
          position: {
            x: x * 64,
            y: y * 64
          }
        })
      )
    }
  })
})
console.log(placementTile)

// Canvas boyutuna göre waypoint’leri ölçekle
function getScaledWaypoints() {
  const scaleX = canvas.width / BASE_WIDTH;
  const scaleY = canvas.height / BASE_HEIGHT;
  scaledWaypoints = waypoints.map(p => ({
    x: p.x * scaleX,
    y: p.y * scaleY
  }));
}

function resizeCanvas() {
  const aspectRatio = BASE_WIDTH / BASE_HEIGHT;
  let width = window.innerWidth;
  let height = width / aspectRatio;

  if (height > window.innerHeight) {
    height = window.innerHeight;
    width = height * aspectRatio;
  }

  canvas.width = width;
  canvas.height = height;

  // waypointleri yeniden ölçekle
  getScaledWaypoints();
}

async function startGame() {
  await assets.loadAll([{ name: "map", src: "img/td-map.png" }]);
  resizeCanvas();
  animate();
}

function drawMap() {
  const map = assets.get("map");
  if (!map) return;
  c.drawImage(map, 0, 0, canvas.width, canvas.height);
}

const BASE_ENEMY_SIZE = 32;
const BASE_ENEMY_SPEED = 2; // Temel hız değeri

class Enemy {
  constructor({ position = { x: 0, y: 0 } }) {
    this.position = { ...position };
    this.baseWidth = BASE_ENEMY_SIZE; // Temel boyutu saklayın
        this.baseHeight = BASE_ENEMY_SIZE;

        this.width = this.baseWidth; // Güncel boyut
        this.height = this.baseHeight;

        this.waypointIndex = 0;
        this.center = {
          x: this.position.x + this.width / 2,
          y: this.position.y + this.height / 2
        }

    this.positionRatio = {
      x: position.x / canvas.width,
      y: position.y / canvas.height
    };
  }

  draw() {
    c.fillStyle = "red";
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    this.draw();

    const waypoint = scaledWaypoints[this.waypointIndex];
    if (!waypoint) return;

    // hedefe olan mesafe
    const dx = waypoint.x - this.center.x;
    const dy = waypoint.y - this.center.y;
    const distance = Math.hypot(dx, dy);

    this.center = {
          x: this.position.x + this.width / 2,
          y: this.position.y + this.height / 2
        }



    // ekran boyutuna göre orantılı hız
    const speed = Math.min(distance, 2);

    const speedScale = canvas.width / BASE_WIDTH;
        const scaledSpeed = BASE_ENEMY_SPEED * speedScale; // Hızı canvas boyutuna göre ölçekle

        const actualSpeed = Math.min(distance, scaledSpeed); // Hedefi geçmeyi önle

        if (distance > 0.5) { 
            this.position.x += (dx / distance) * actualSpeed;
            this.position.y += (dy / distance) * actualSpeed;
        } else if (this.waypointIndex < scaledWaypoints.length - 1) {
            this.waypointIndex++;
        }

    // resize sonrası pozisyon için oran güncelle
    
    this.center = {
          x: this.position.x + this.width / 2,
          y: this.position.y + this.height / 2
        }
    
    this.positionRatio.x = this.position.x / canvas.width;
    this.positionRatio.y = this.position.y / canvas.height;
  }

  resize() {
    this.position.x = this.positionRatio.x * canvas.width;
    this.position.y = this.positionRatio.y * canvas.height;

    const scale = canvas.width / BASE_WIDTH; // Veya Math.min(canvas.width / BASE_WIDTH, canvas.height / BASE_HEIGHT);
        this.width = this.baseWidth * scale;
        this.height = this.baseHeight * scale;

    this.center = {
          x: this.position.x + this.width / 2,
          y: this.position.y + this.height / 2
        }    
  }
}

// Enemyleri oluştur
resizeCanvas(); // scaledWaypoints için gerekli

// enemy2 için temel çözünürlüğe göre konumu hesapla
const BASE_SPAWN_OFFSET = 150



const enemies = []
for(let i = 0; i < 10; i++) {
  const initialOffsetX = i * BASE_SPAWN_OFFSET;
  
  
  
  const initialX = scaledWaypoints[0].x - initialOffsetX;
    const initialY = scaledWaypoints[0].y; 

    const newEnemy = new Enemy({
        position: { x: initialX, y: initialY }
    });
    
    enemies.push(newEnemy);
  }



enemies.forEach(enemy => {
  enemy.update()
})

function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, canvas.width, canvas.height);
  drawMap();
  
  enemies.forEach(enemy => {
  enemy.update()
})
  
}



// Resize event
window.addEventListener("resize", () => {
  resizeCanvas();
  enemies.forEach(enemy => {
  enemy.resize()
})
  drawMap();
});

// Başlatma butonu
startBtn.addEventListener("click", () => {
  menu.style.display = "none";
  startGame();
});


placementTilesData2D.forEach(tile => {
  tile.update(mouse)
})
 
const mouse = {
  x: undefined,
  y : undefined
}
 
window.addEventListener('mousemove', (Event) => {
  mouse.x =Event.clientX
  mouse.y = Event.clientY
  console.log(Event)
})
