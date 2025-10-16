import { AssetManager } from "./assets.js";

const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
const assets = new AssetManager();

// Base resolution for scaling calculations
const BASE_WIDTH = 1280;
const BASE_HEIGHT = 768;

let scaledWaypoints = [];

// Track mouse position relative to the canvas
const mouse = { x: 0, y: 0 };

canvas.addEventListener("click", (event) => {
  if (activeTile) {
    buildings.push(new Building({
      position: {
        x: activeTile.position.x,
        y:activeTile.position.y
      },
      positionRatio: {
        x: activeTile.positionRatio.x,
        y: activeTile.positionRatio.y
    }
  }))
    
  }
})

window.addEventListener('mousemove', (event) => {
    // Get the canvas position and size relative to the window
    const rect = canvas.getBoundingClientRect(); 
    
    // Adjust mouse coordinates so that (0,0) is the top-left corner of the canvas
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;

    activeTile = null
    for (let i = 0; i < placementTiles.length; i++) {
      const tile = placementTiles[i]
      if (
      mouse.x > tile.position.x &&
      mouse.x < tile.position.x + tile.size &&
      mouse.y > tile.position.y &&
      mouse.y < tile.position.y + tile.size
    ) {
      activeTile = tile
      break
    }
    }

});


// === BUILDING PLACEMENT === //
const TILE_BASE_SIZE = 64;
const placementTilesData2D = [];

// Convert the 1D placementTilesData array into a 2D array (20 columns per row)
for (let i = 0; i < placementTilesData.length; i += 20) {
  placementTilesData2D.push(placementTilesData.slice(i, i + 20));
}

// Tile class representing each buildable area
class placementTile {
  constructor({ basePosition = { x: 0, y: 0 } }) {
    this.position = basePosition;
    this.baseSize = TILE_BASE_SIZE;
    this.color = 'rgba(255,255,255,0.15)';

    // Save position ratio relative to base resolution
    this.positionRatio = {
      x: basePosition.x / BASE_WIDTH,
      y: basePosition.y / BASE_HEIGHT
    };
  }

  draw() {
    c.fillStyle = this.color;
    c.fillRect(this.position.x, this.position.y, this.size, this.size);
  }

  // Adjust size and position when window or canvas is resized
  resize() {
    this.position.x = this.positionRatio.x * canvas.width;
    this.position.y = this.positionRatio.y * canvas.height;

    // Scale tile size based on canvas width ratio
    const scale = canvas.width / BASE_WIDTH;
    this.size = this.baseSize * scale;
  }

  // Update tile color on hover and draw
  update(mouse) { 
    this.draw();

    if (
      mouse.x > this.position.x &&
      mouse.x < this.position.x + this.size &&
      mouse.y > this.position.y &&
      mouse.y < this.position.y + this.size
    ) {
      console.log('colliding');
      this.color = 'white';
    } else {
      this.color = 'rgba(255,255,255,0.15)';
    }
  }
}

// Create placement tiles from data
const placementTiles = [];

placementTilesData2D.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if (symbol === 14) {
      placementTiles.push(
        new placementTile({
          basePosition: {
            x: x * TILE_BASE_SIZE,
            y: y * TILE_BASE_SIZE
          }
        })
      );
    }
  });
});

console.log(placementTilesData2D);

// === WAYPOINT SCALING === //
// Scale waypoints according to the current canvas size
function getScaledWaypoints() {
  const scaleX = canvas.width / BASE_WIDTH;
  const scaleY = canvas.height / BASE_HEIGHT;
  scaledWaypoints = waypoints.map(p => ({
    x: p.x * scaleX,
    y: p.y * scaleY
  }));
}

// === CANVAS RESIZE HANDLER === //
function resizeCanvas() {
  const aspectRatio = BASE_WIDTH / BASE_HEIGHT;
  let width = window.innerWidth;
  let height = width / aspectRatio;

  // Maintain aspect ratio by limiting height
  if (height > window.innerHeight) {
    height = window.innerHeight;
    width = height * aspectRatio;
  }

  canvas.width = width;
  canvas.height = height;

  // Rescale waypoints when canvas size changes
  getScaledWaypoints();
}

// === GAME INITIALIZATION === //
async function startGame() {
  await assets.loadAll([{ name: "map", src: "img/td-map.png" }]);
  resizeCanvas();
  animate();
}

// Draw the map background
function drawMap() {
  const map = assets.get("map");
  if (!map) return;
  c.drawImage(map, 0, 0, canvas.width, canvas.height);
}

// === ENEMY CLASS === //
const BASE_ENEMY_SIZE = 32;
const BASE_ENEMY_SPEED = 2;

class Enemy {
  constructor({ position = { x: 0, y: 0 } }) {
    this.position = { ...position };
    this.baseWidth = BASE_ENEMY_SIZE;
    this.baseHeight = BASE_ENEMY_SIZE;

    this.width = this.baseWidth;
    this.height = this.baseHeight;

    this.waypointIndex = 0;
    this.center = {
      x: this.position.x + this.width / 2,
      y: this.position.y + this.height / 2
    };

    // Save proportional position for resizing
    this.positionRatio = {
      x: position.x / canvas.width,
      y: position.y / canvas.height
    };
  }


  draw() {
    c.fillStyle = "red";
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  // Update enemy position and movement along waypoints
  update() {
    this.draw();

    const waypoint = scaledWaypoints[this.waypointIndex];
    if (!waypoint) return;

    // Calculate direction vector to the current waypoint
    const dx = waypoint.x - this.center.x;
    const dy = waypoint.y - this.center.y;
    const distance = Math.hypot(dx, dy);

    // Recalculate center
    this.center = {
      x: this.position.x + this.width / 2,
      y: this.position.y + this.height / 2
    };

    // Scale movement speed based on screen width
    const speedScale = canvas.width / BASE_WIDTH;
    const scaledSpeed = BASE_ENEMY_SPEED * speedScale;

    // Prevent overshooting the waypoint
    const actualSpeed = Math.min(distance, scaledSpeed);

    if (distance > 0.5) { 
      // Move enemy toward the waypoint
      this.position.x += (dx / distance) * actualSpeed;
      this.position.y += (dy / distance) * actualSpeed;
    } else if (this.waypointIndex < scaledWaypoints.length - 1) {
      // Move to next waypoint once current one is reached
      this.waypointIndex++;
    }

    // Update center and ratio for responsive resizing
    this.center = {
      x: this.position.x + this.width / 2,
      y: this.position.y + this.height / 2
    };

    this.positionRatio.x = this.position.x / canvas.width;
    this.positionRatio.y = this.position.y / canvas.height;
  }


  // Recalculate position and size when the window resizes
  resize() {
    this.position.x = this.positionRatio.x * canvas.width;
    this.position.y = this.positionRatio.y * canvas.height;

    const scale = canvas.width / BASE_WIDTH; 
    this.width = this.baseWidth * scale;
    this.height = this.baseHeight * scale;

    this.center = {
      x: this.position.x + this.width / 2,
      y: this.position.y + this.height / 2
    };    
  }
}

//START OF BUILDING CLASS DEFINITION
  class Building {
    constructor({position = {x: 0, y:0}, positionRatio}) {
      this.baseSize = TILE_BASE_SIZE

      this.positionRatio = positionRatio 
    
        this.position = position;
    this.size = this.baseSize;

    this.resize();
  }
    draw() {
      c.fillStyle = "blue"
      c.fillRect(this.position.x, this.position.y, this.size, this.size);
    }

    resize() {
        const scale = canvas.width / BASE_WIDTH;
        
        
        this.position.x = this.positionRatio.x * canvas.width;
        this.position.y = this.positionRatio.y * canvas.height;
        
        
        this.size = this.baseSize * scale;
    }
  }

// === ENEMY SPAWNING === //
resizeCanvas(); // Required before creating enemies (scaled waypoints must exist)

const BASE_SPAWN_OFFSET = 150; // Distance between spawned enemies

const enemies = [];
for (let i = 0; i < 10; i++) {
  const initialOffsetX = i * BASE_SPAWN_OFFSET;

  const initialX = scaledWaypoints[0].x - initialOffsetX;
  const initialY = scaledWaypoints[0].y;

  const newEnemy = new Enemy({
    position: { x: initialX, y: initialY }
  });

  enemies.push(newEnemy);
}
// buildings: Stores all placed towers
const buildings = []
let activeTile = undefined

// Initialize tiles and enemies
enemies.forEach(enemy => {
  enemy.update();
});

placementTiles.forEach(tile => {
  tile.resize();
});

// === MAIN GAME LOOP === //
function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, canvas.width, canvas.height);
  drawMap();

  // Update enemies
  enemies.forEach(enemy => {
    enemy.update();
  });

  // Update placement tiles and mouse hover effects
  placementTiles.forEach((tile) => {
    tile.update(mouse);
  });

  buildings.forEach(building => {
    building.draw()
  })
}

// === WINDOW RESIZE HANDLING === //
window.addEventListener("resize", () => {
  resizeCanvas();
  
  // Resize enemies based on new canvas size
  enemies.forEach(enemy => {
    enemy.resize();
  });
  
  // Resize placement tiles
  placementTiles.forEach(tile => {
    tile.resize();
  });

  buildings.forEach(building => {
        building.resize(); // Building sınıfına eklediğiniz metot
    });
  
  drawMap();
});

// === START BUTTON === //
startBtn.addEventListener("click", () => {
  menu.style.display = "none";
  startGame();
});
