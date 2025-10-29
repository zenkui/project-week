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
  if (activeTile && !activeTile.isOccupied && coins - 50 >= 0) {
    coins -= 50
    document.querySelector("#currentmoney").innerHTML = coins
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

  activeTile.isOccupied = true;
    
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
const TOWER_BASE_SIZE = 128;
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
    //Monitors whether the container is full
    this.isOccupied = false;
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
  await assets.loadAll([
    { name: "map", src: "img/td-map.png" },
    { name:"goblin-sprite", src: "img/goblin.png"},
    { name:"tower-mortar", src: "img/tower-mortar.png" }
  ]);
  spawnEnemies(enemyCount)

  enemies.forEach(enemy => {
    enemy.resize(); 
  });
  
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
const BASE_ENEMY_SIZE = 128;
const BASE_ENEMY_SPEED = 1.5;


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

    // SPRITE AND ANIMATION INFORMATION
    this.image = assets.get('goblin-sprite'); // Download the image
    this.frames = 0;                          // General animation frame counter (controls speed)
    this.currentFrame = 0;                    // 
    this.totalFrames = 11;                    // Total number of frames
    
    
    this.frameWidth = this.image.width / this.totalFrames;

    this.health = 100
  }


  draw() {
    

    
    c.drawImage(
        this.image, 
        
        
        this.currentFrame * this.frameWidth, 
        0,                                   
        this.frameWidth,                     
        this.image.height,                   
        
        
        this.position.x, 
        this.position.y, 
        this.width,     
        this.height     
    );
    

    
    //health bars
    c.fillStyle = "red";
    c.fillRect(this.position.x, this.position.y - 15, this.width, 10);

    c.fillStyle = "green";
    c.fillRect(this.position.x, this.position.y - 15, this.width * this.health / 100, 10);
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
      //The enemy has reached its final point.
      else {
        this.reachedEnd = true;
      }

    // Update center and ratio for responsive resizing
    this.center = {
      x: this.position.x + this.width / 2,
      y: this.position.y + this.height / 2
    };

    this.positionRatio.x = this.position.x / canvas.width;
    this.positionRatio.y = this.position.y / canvas.height;

    
    this.frames++; // Increase the counter in each animation frame

    
    if (this.frames % 5 === 0) { 
        this.currentFrame++;
        
        
        if (this.currentFrame >= this.totalFrames) { 
            this.currentFrame = 0;
        }
    }
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
//Start of shooting projectiles
class Projectile {
  constructor({position = {x:0, y:0}, enemy}) {
    this.baseRadius = 10;
    this.radius = this.baseRadius;
    this.position = position 
    this.velocity = {
      x: 0,
      y: 0
    }
    this.baseSpeed = 2;
    this.speed = this.baseSpeed;

    this.enemy = enemy;

    this.image = new Image()
    this.image.src = "img/stone.png"

    this.resize();
  }
  draw() {
   

    // Calculate the drawing position offset to center the image on this.position.
    // We subtract half the image width/height because drawImage draws from the top-left corner.
    const drawX = this.position.x - this.image.width / 2;
    const drawY = this.position.y - this.image.height / 2;

    c.drawImage(
        this.image, 
        drawX, 
        drawY
    )
  }
  resize() {
    const scale = canvas.width / BASE_WIDTH;

    this.radius = this.baseRadius * scale;

    this.speed = this.baseSpeed * scale
  }
  update() {
    this.draw()

    const angle = Math.atan2(
      this.enemy.center.y -this.position.y,
      this.enemy.center.x -this.position.x

    )

    this.velocity.x = Math.cos(angle) * this.speed
    this.velocity.y = Math.sin(angle) * this.speed

    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
  }
}

//START OF BUILDING CLASS DEFINITION
  class Building {
    constructor({position = {x: 0, y:0}, positionRatio}) {
      this.baseSize = TILE_BASE_SIZE
      this.baseDrawSize = TOWER_BASE_SIZE;

      this.baseRadius = 250;          //tower attack range

      this.positionRatio = positionRatio 
    
        this.position = position;
    this.size = this.baseSize;

    

    

    this.projectiles = []
    this.target
    this.frames = 0



    // Tower visuals and animation variables
      this.image = assets.get("tower-mortar"); 
      this.totalFrames = 2; 
      this.currentFrame = 0;
      
      this.frameWidth = this.image.width / this.totalFrames;

      this.resize();
    
  }
    draw() {
      
   
     // X-axis: 128px back from the center of the 64px square, half the size of the image
      const drawX = this.center.x - this.drawSize / 2;
 
      // Y Axis: Anchor the tower BELOW the 64px square (position.y + size) and draw it up to 128px
      // (position.y + size) - drawSize = bottom edge of 64px square - 128px drawing size
      const drawY = (this.position.y + this.size) - this.drawSize;
      
        c.drawImage(
        this.image, 
 

        this.currentFrame * this.frameWidth, 
         0, 
        this.frameWidth,
        this.image.height, 


        drawX, // Centered X
        drawY, // 2 Sliding tiles Y
        this.drawSize,  // 128px scaled width
        this.drawSize  // 128px scaled width
     );

      //attack range and target codes for towers
      c.beginPath()
      c.arc(this.center.x, this.center.y, this.radius, 0, Math.PI*2)
      //c.fillStyle = ("rgba(0, 0, 255, 0.2")
      c.fill()
    }

    update() {
      this.draw()

      if (this.target) {
          // If there is a target, show the first square (ready to fire)
          this.currentFrame = 1;
      } else {
          // If there is no target, display the 0th frame (waiting)
          this.currentFrame = 0;
      }
      if (this.frames % 75 === 0 && this.target) {
        this.projectiles.push(new Projectile({
        position: {
          x: this.center.x,
          y: this.center.y
        },
        enemy: this.target
      }))
      }

      this.frames++
    }

    resize() {
        const scale = canvas.width / BASE_WIDTH;
        
        
        this.position.x = this.positionRatio.x * canvas.width;
        this.position.y = this.positionRatio.y * canvas.height;
        
        this.drawSize = this.baseDrawSize * scale;

        this.size = this.baseSize * scale;

        this.center = {
          x: this.position.x + this.size / 2,
          y: this.position.y + this.size / 2
        }
        this.radius = this.baseRadius * scale;
    }
  }

// === ENEMY SPAWNING === //
resizeCanvas(); // Required before creating enemies (scaled waypoints must exist)

const BASE_SPAWN_OFFSET = 150; // Distance between spawned enemies

const enemies = [];

function spawnEnemies(spawnCount) {
  for (let i = 0; i < spawnCount; i++) {
    const spawnIndex = i + 1
    const initialOffsetX = spawnIndex * BASE_SPAWN_OFFSET;

    const initialX = scaledWaypoints[0].x - initialOffsetX;
    const initialY = scaledWaypoints[0].y;

    const newEnemy = new Enemy({
      position: { x: initialX, y: initialY }
    });

    enemies.push(newEnemy);
  }
}



// buildings: Stores all placed towers
const buildings = []
let activeTile = undefined

let hearts = 10
let coins = 100
let enemyCount = 3




// Initialize tiles and enemies
enemies.forEach(enemy => {
  enemy.update();
});

placementTiles.forEach(tile => {
  tile.resize();
});

// === MAIN GAME LOOP === //
function animate() {
  const animationId = requestAnimationFrame(animate);
  c.clearRect(0, 0, canvas.width, canvas.height);
  drawMap();

  // Update enemies
  for (let i = enemies.length -1; i>= 0; i--) {
    const enemy = enemies[i]
    enemy.update()

    if (enemy.reachedEnd  || enemy.position.y > canvas.height) {
      hearts -= 1
      enemies.splice(i, 1)
      document.querySelector("#currentheart").innerHTML = hearts

      if (hearts === 0) {
        console.log("game over")
        cancelAnimationFrame(animationId)
        document.querySelector("#end").style.display = "flex";
      }
      
    }
  }

  //tracking total amaount of enemies
  if (enemies.length === 0) {
    enemyCount += 2
    spawnEnemies(enemyCount)
  }

  // Update placement tiles and mouse hover effects
  placementTiles.forEach((tile) => {
    tile.update(mouse);
  });

  buildings.forEach(building => {
  
    building.target = null
    const validEnemies = enemies.filter((enemy) => {
      const xDifference = enemy.center.x - building.center.x
      const yDifference = enemy.center.y - building.center.y
      const distance = Math.hypot(xDifference, yDifference)
      return distance < building.radius
    })
    building.target = validEnemies[0]

    building.update()

    


    for (let i = building.projectiles.length - 1; i>= 0; i--) {
      const projectile = building.projectiles[i]

      projectile.update()
      
      const xDifference = projectile.enemy.center.x - projectile.position.x
      const yDifference = projectile.enemy.center.y - projectile.position.y
      const distance = Math.hypot(xDifference, yDifference)

      // this is when a projectile hits an enemy
      if (distance < projectile.enemy.width + projectile.radius) {
        //enemy health and enemy removal
        projectile.enemy.health -= 20
        if (projectile.enemy.health <= 0) {
          const enemyIndex = enemies.findIndex((enemy) => {
            return projectile.enemy === enemy
          })

          if (enemyIndex > -1) {
            enemies.splice(enemyIndex, 1)
            coins += 25
            document.querySelector("#currentmoney").innerHTML = coins
          }
        }

        
        
        building.projectiles.splice(i, 1)
      }
    }
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
        building.resize(); 
    });
  
  drawMap();
});

// === START BUTTON === //
startBtn.addEventListener("click", () => {
  menu.style.display = "none";

  document.getElementById('gameInfo').style.display = 'flex';
  startGame();
});
