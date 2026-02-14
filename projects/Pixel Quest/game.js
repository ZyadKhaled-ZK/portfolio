        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        
        // Game configuration
        const CANVAS_WIDTH = 800;
        const CANVAS_HEIGHT = 600;
        const TILE_SIZE = 32;
        const GRAVITY = 0.4;
        const MAX_FALL_SPEED = 10;
        
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;

        // Game state
        let gameState = {
            running: false,
            paused: false,
            level: 1,
            score: 0,
            coins: 0,
            maxLevel: 3
        };

        // Input handling
        const keys = {};
        
        document.addEventListener('keydown', (e) => {
            keys[e.key] = true;
            if (e.key === 'Escape' && gameState.running) {
                togglePause();
            }
            if (e.key === ' ') {
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            keys[e.key] = false;
        });

        // Player class
        class Player {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.width = 24;
                this.height = 32;
                this.velocityX = 0;
                this.velocityY = 0;
                this.speed = 2.5;
                this.jumpPower = 9;
                this.onGround = false;
                this.maxHealth = 5;
                this.health = this.maxHealth;
                this.invincible = false;
                this.invincibleTimer = 0;
                this.direction = 1; // 1 = right, -1 = left
                this.onWall = false; // Track if touching wall
                this.wallSide = 0; // -1 = left wall, 1 = right wall
                this.wallJumpPower = 5; // Half jump power for wall jumps
                
                // Stamina system
                this.maxStamina = 100;
                this.stamina = this.maxStamina;
                this.staminaRegenRate = 0.5;
                this.sprintMultiplier = 1.8;
                this.isSprinting = false;
                
                // Sliding
                this.isSliding = false;
                this.slideSpeed = 6;
                this.slideDuration = 0;
                this.slideMaxDuration = 30; // frames
                
                // Gun system
                this.hasGun = true;
                this.bullets = [];
                this.maxBullets = 3; // bullets on screen at once
                this.shootCooldown = 0;
                this.shootCooldownMax = 20; // frames between shots
            }

            update(platforms) {
                // Shooting cooldown
                if (this.shootCooldown > 0) this.shootCooldown--;
                
                // Check for sprint (Shift key)
                this.isSprinting = keys['Shift'] && this.stamina > 0 && !this.isSliding;
                
                // Check for slide (Down arrow while moving and has stamina)
                if (keys['ArrowDown'] && this.onGround && !this.isSliding && this.stamina >= 20 && Math.abs(this.velocityX) > 1) {
                    this.isSliding = true;
                    this.slideDuration = this.slideMaxDuration;
                    this.stamina -= 20;
                }
                
                // Handle sliding
                if (this.isSliding) {
                    this.slideDuration--;
                    this.velocityX = this.slideSpeed * this.direction;
                    if (this.slideDuration <= 0 || !this.onGround) {
                        this.isSliding = false;
                    }
                } else {
                    // Horizontal movement (only if not sliding)
                    let currentSpeed = this.speed;
                    if (this.isSprinting && this.onGround) {
                        currentSpeed *= this.sprintMultiplier;
                        this.stamina -= 0.5; // Drain stamina while sprinting
                    }
                    
                    if (keys['ArrowLeft']) {
                        this.velocityX = -currentSpeed;
                        this.direction = -1;
                    } else if (keys['ArrowRight']) {
                        this.velocityX = currentSpeed;
                        this.direction = 1;
                    } else {
                        this.velocityX *= 0.8;
                        if (Math.abs(this.velocityX) < 0.1) {
                            this.velocityX = 0;
                        }
                    }
                }
                
                // Regenerate stamina when not sprinting or sliding
                if (!this.isSprinting && !this.isSliding && this.stamina < this.maxStamina) {
                    this.stamina += this.staminaRegenRate;
                    if (this.stamina > this.maxStamina) this.stamina = this.maxStamina;
                }
                
                // Shooting (X key)
                if (keys['x'] && this.shootCooldown === 0 && this.bullets.length < this.maxBullets) {
                    this.shoot();
                    this.shootCooldown = this.shootCooldownMax;
                }
                
                // Update bullets
                this.bullets = this.bullets.filter(bullet => {
                    bullet.x += bullet.velocityX;
                    bullet.lifetime--;
                    return bullet.lifetime > 0 && bullet.x > 0 && bullet.x < CANVAS_WIDTH;
                });

                // Apply gravity
                this.velocityY += GRAVITY;
                if (this.velocityY > MAX_FALL_SPEED) {
                    this.velocityY = MAX_FALL_SPEED;
                }

                // Update horizontal position
                this.x += this.velocityX;
                
                // Screen bounds for horizontal
                if (this.x < 0) {
                    this.x = 0;
                    this.velocityX = 0;
                }
                if (this.x + this.width > CANVAS_WIDTH) {
                    this.x = CANVAS_WIDTH - this.width;
                    this.velocityX = 0;
                }
                
                // Check horizontal collisions (detect walls)
                this.onWall = false;
                this.wallSide = 0;
                for (let platform of platforms) {
                    if (this.intersects(platform)) {
                        if (this.velocityX > 0) {
                            this.x = platform.x - this.width;
                            this.onWall = true;
                            this.wallSide = 1; // Right wall
                        } else if (this.velocityX < 0) {
                            this.x = platform.x + platform.width;
                            this.onWall = true;
                            this.wallSide = -1; // Left wall
                        }
                        this.velocityX = 0;
                    }
                }

                // Update vertical position
                this.y += this.velocityY;

                // Check vertical collisions (ground and ceiling)
                this.onGround = false;
                for (let platform of platforms) {
                    if (this.intersects(platform)) {
                        if (this.velocityY > 0) {
                            // Landing on top of platform
                            this.y = platform.y - this.height;
                            this.velocityY = 0;
                            this.onGround = true;
                        } else if (this.velocityY < 0) {
                            // Hitting ceiling
                            this.y = platform.y + platform.height;
                            this.velocityY = 0;
                        }
                    }
                }

                // Jumping - normal jump on ground, wall jump on walls
                if (keys[' ']) {
                    if (this.onGround && this.stamina >= 10 && !this.isSliding) {
                        // Normal full jump
                        this.velocityY = -this.jumpPower;
                        this.onGround = false;
                        this.stamina -= 10;
                    } else if (this.onWall && !this.onGround && this.stamina >= 15) {
                        // Wall jump - half height jump
                        this.velocityY = -this.wallJumpPower;
                        // Small push away from wall
                        this.velocityX = -this.wallSide * this.speed * 0.5;
                        this.onWall = false;
                        this.stamina -= 15;
                    }
                }
                
                // Fall off screen
                if (this.y > CANVAS_HEIGHT) {
                    this.takeDamage(1);
                    this.respawn();
                }

                // Invincibility timer
                if (this.invincible) {
                    this.invincibleTimer--;
                    if (this.invincibleTimer <= 0) {
                        this.invincible = false;
                    }
                }
            }

            shoot() {
                this.bullets.push({
                    x: this.x + (this.direction === 1 ? this.width : 0),
                    y: this.y + this.height / 2,
                    velocityX: this.direction * 8,
                    width: 8,
                    height: 4,
                    lifetime: 120 // 2 seconds
                });
            }

            checkCollisions(platforms) {
                for (let platform of platforms) {
                    if (this.intersects(platform)) {
                        // Calculate overlap on each side
                        const overlapLeft = (this.x + this.width) - platform.x;
                        const overlapRight = (platform.x + platform.width) - this.x;
                        const overlapTop = (this.y + this.height) - platform.y;
                        const overlapBottom = (platform.y + platform.height) - this.y;
                        
                        // Find smallest overlap
                        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
                        
                        // Resolve collision based on smallest overlap
                        if (minOverlap === overlapTop && this.velocityY > 0) {
                            // Bottom collision (landing on platform)
                            this.y = platform.y - this.height;
                            this.velocityY = 0;
                            this.onGround = true;
                        } else if (minOverlap === overlapBottom && this.velocityY < 0) {
                            // Top collision (hitting head)
                            this.y = platform.y + platform.height;
                            this.velocityY = 0;
                        } else if (minOverlap === overlapLeft && this.velocityX > 0) {
                            // Right collision
                            this.x = platform.x - this.width;
                            this.velocityX = 0;
                        } else if (minOverlap === overlapRight && this.velocityX < 0) {
                            // Left collision
                            this.x = platform.x + platform.width;
                            this.velocityX = 0;
                        }
                    }
                }
            }

            intersects(rect) {
                return this.x < rect.x + rect.width &&
                       this.x + this.width > rect.x &&
                       this.y < rect.y + rect.height &&
                       this.y + this.height > rect.y;
            }

            takeDamage(amount) {
                if (!this.invincible) {
                    this.health -= amount;
                    this.invincible = true;
                    this.invincibleTimer = 60; // 1 second at 60fps
                    
                    if (this.health <= 0) {
                        gameOver();
                    }
                    updateUI();
                }
            }

            respawn() {
                this.x = 50;
                this.y = 300;
                this.velocityX = 0;
                this.velocityY = 0;
            }

            draw() {
                // Flicker when invincible
                if (this.invincible && Math.floor(this.invincibleTimer / 5) % 2 === 0) {
                    return;
                }

                // Wall jump indicator - glow when on wall
                if (this.onWall && !this.onGround) {
                    ctx.strokeStyle = '#ffd700';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
                }

                // Sprint indicator - blue trail
                if (this.isSprinting) {
                    ctx.fillStyle = 'rgba(52, 152, 219, 0.3)';
                    ctx.fillRect(this.x - 5 * this.direction, this.y, 5, this.height);
                }

                // Sliding - draw horizontally
                if (this.isSliding) {
                    ctx.fillStyle = '#3498db';
                    ctx.fillRect(this.x, this.y + 16, this.width, 16);
                    ctx.fillStyle = '#f39c12';
                    ctx.fillRect(this.x + 4, this.y + 18, 16, 10);
                    ctx.fillStyle = '#000';
                    ctx.fillRect(this.x + (this.direction === 1 ? 12 : 8), this.y + 22, 4, 4);
                } else {
                    // Normal standing
                    // Body
                    ctx.fillStyle = '#3498db';
                    ctx.fillRect(this.x, this.y, this.width, this.height);
                    
                    // Head
                    ctx.fillStyle = '#f39c12';
                    ctx.fillRect(this.x + 4, this.y + 2, 16, 12);
                    
                    // Eyes
                    ctx.fillStyle = '#000';
                    if (this.direction === 1) {
                        ctx.fillRect(this.x + 12, this.y + 6, 4, 4);
                    } else {
                        ctx.fillRect(this.x + 8, this.y + 6, 4, 4);
                    }
                    
                    // Gun in hand
                    if (this.hasGun) {
                        ctx.fillStyle = '#34495e';
                        if (this.direction === 1) {
                            ctx.fillRect(this.x + 20, this.y + 14, 8, 4);
                        } else {
                            ctx.fillRect(this.x - 4, this.y + 14, 8, 4);
                        }
                    }
                    
                    // Legs
                    ctx.fillStyle = '#2c3e50';
                    ctx.fillRect(this.x + 4, this.y + 24, 6, 8);
                    ctx.fillRect(this.x + 14, this.y + 24, 6, 8);
                }
                
                // Draw bullets
                this.bullets.forEach(bullet => {
                    ctx.fillStyle = '#f1c40f';
                    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                    // Bullet trail
                    ctx.fillStyle = 'rgba(241, 196, 15, 0.3)';
                    ctx.fillRect(bullet.x - bullet.velocityX * 0.5, bullet.y, bullet.width, bullet.height);
                });
            }
        }

        // Enemy class
        class Enemy {
            constructor(x, y, type = 'walker') {
                this.x = x;
                this.y = y;
                this.width = 28;
                this.height = 28;
                this.type = type; // walker, jumper, shooter
                this.velocityX = type === 'jumper' ? 1.5 : 1.2;
                this.velocityY = 0;
                this.patrolDistance = type === 'shooter' ? 0 : 100;
                this.startX = x;
                this.active = true;
                this.health = type === 'shooter' ? 2 : 1;
                
                // Jumper specific
                this.jumpTimer = 0;
                this.jumpInterval = 60;
                
                // Shooter specific
                this.bullets = [];
                this.shootCooldown = 0;
                this.shootInterval = 90;
                this.detectionRange = 300;
            }

            update(platforms) {
                if (!this.active) return;

                // Type-specific behavior
                if (this.type === 'jumper' && this.onGround) {
                    this.jumpTimer++;
                    if (this.jumpTimer >= this.jumpInterval) {
                        this.velocityY = -7;
                        this.jumpTimer = 0;
                    }
                }
                
                if (this.type === 'shooter') {
                    this.shootCooldown--;
                    // Shoot at player if in range
                    if (player && this.shootCooldown <= 0) {
                        const dist = Math.abs(player.x - this.x);
                        if (dist < this.detectionRange) {
                            this.shoot();
                            this.shootCooldown = this.shootInterval;
                        }
                    }
                    
                    // Update bullets
                    this.bullets = this.bullets.filter(bullet => {
                        bullet.x += bullet.velocityX;
                        bullet.lifetime--;
                        return bullet.lifetime > 0 && bullet.x > 0 && bullet.x < CANVAS_WIDTH;
                    });
                }

                // Patrol movement
                if (this.patrolDistance > 0) {
                    this.x += this.velocityX;
                    
                    // Check for holes/edges and reverse direction
                    let foundGroundAhead = false;
                    for (let platform of platforms) {
                        const checkX = this.x + (this.velocityX > 0 ? this.width + 10 : -10);
                        const checkY = this.y + this.height + 5;
                        
                        if (checkX > platform.x && checkX < platform.x + platform.width &&
                            checkY > platform.y && checkY < platform.y + platform.height) {
                            foundGroundAhead = true;
                            break;
                        }
                    }
                    
                    // Reverse if no ground ahead or reached patrol distance
                    if (!foundGroundAhead || Math.abs(this.x - this.startX) > this.patrolDistance) {
                        this.velocityX *= -1;
                    }
                }

                // Apply gravity
                this.velocityY += GRAVITY;
                this.y += this.velocityY;

                // Platform collision
                this.onGround = false;
                for (let platform of platforms) {
                    if (this.intersects(platform) && this.velocityY > 0) {
                        this.y = platform.y - this.height;
                        this.velocityY = 0;
                        this.onGround = true;
                    }
                }
                
                // Remove if fell off screen
                if (this.y > CANVAS_HEIGHT + 100) {
                    this.active = false;
                }
            }

            shoot() {
                const direction = player.x > this.x ? 1 : -1;
                this.bullets.push({
                    x: this.x + this.width / 2,
                    y: this.y + this.height / 2,
                    velocityX: direction * 4,
                    width: 6,
                    height: 6,
                    lifetime: 120
                });
            }

            takeDamage(amount) {
                this.health -= amount;
                if (this.health <= 0) {
                    this.active = false;
                    gameState.score += 100;
                    updateUI();
                }
            }

            intersects(rect) {
                return this.x < rect.x + rect.width &&
                       this.x + this.width > rect.x &&
                       this.y < rect.y + rect.height &&
                       this.y + this.height > rect.y;
            }

            draw() {
                if (!this.active) return;

                // Different colors for different types
                let bodyColor = '#e74c3c';
                if (this.type === 'jumper') bodyColor = '#9b59b6';
                if (this.type === 'shooter') bodyColor = '#e67e22';

                // Body
                ctx.fillStyle = bodyColor;
                ctx.fillRect(this.x, this.y, this.width, this.height);
                
                // Eyes
                ctx.fillStyle = '#fff';
                ctx.fillRect(this.x + 4, this.y + 8, 8, 8);
                ctx.fillRect(this.x + 16, this.y + 8, 8, 8);
                
                ctx.fillStyle = '#000';
                ctx.fillRect(this.x + 6, this.y + 10, 4, 4);
                ctx.fillRect(this.x + 18, this.y + 10, 4, 4);
                
                // Type indicator
                if (this.type === 'jumper') {
                    // Spring symbol
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(this.x + 10, this.y + 20, 3, 6);
                    ctx.fillRect(this.x + 15, this.y + 20, 3, 6);
                } else if (this.type === 'shooter') {
                    // Gun
                    ctx.fillStyle = '#34495e';
                    ctx.fillRect(this.x + this.width, this.y + 14, 6, 4);
                }
                
                // Teeth
                ctx.fillStyle = '#fff';
                for (let i = 0; i < 4; i++) {
                    ctx.fillRect(this.x + 4 + i * 5, this.y + 20, 3, 4);
                }
                
                // Health bar for shooters
                if (this.type === 'shooter' && this.health < 2) {
                    ctx.fillStyle = '#c0392b';
                    ctx.fillRect(this.x, this.y - 6, this.width, 3);
                    ctx.fillStyle = '#27ae60';
                    ctx.fillRect(this.x, this.y - 6, this.width * (this.health / 2), 3);
                }
                
                // Draw enemy bullets
                this.bullets.forEach(bullet => {
                    ctx.fillStyle = '#c0392b';
                    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                });
            }
        }

        // Coin class
        class Coin {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.width = 16;
                this.height = 16;
                this.collected = false;
                this.animation = 0;
            }

            update() {
                if (!this.collected) {
                    this.animation += 0.1;
                }
            }

            draw() {
                if (this.collected) return;

                const offset = Math.sin(this.animation) * 4;
                ctx.fillStyle = '#ffd700';
                ctx.beginPath();
                ctx.arc(this.x + 8, this.y + 8 + offset, 8, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = '#ff8800';
                ctx.beginPath();
                ctx.arc(this.x + 8, this.y + 8 + offset, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Goal flag
        class Goal {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.width = 40;
                this.height = 80;
                this.animation = 0;
            }

            update() {
                this.animation += 0.05;
            }

            draw() {
                // Pole
                ctx.fillStyle = '#7f8c8d';
                ctx.fillRect(this.x + 18, this.y, 4, this.height);
                
                // Flag
                const wave = Math.sin(this.animation) * 5;
                ctx.fillStyle = '#2ecc71';
                ctx.beginPath();
                ctx.moveTo(this.x + 22, this.y + 10);
                ctx.lineTo(this.x + 22 + 30 + wave, this.y + 20);
                ctx.lineTo(this.x + 22, this.y + 30);
                ctx.closePath();
                ctx.fill();
                
                // Base
                ctx.fillStyle = '#7f8c8d';
                ctx.fillRect(this.x + 10, this.y + this.height, 20, 8);
            }
        }

        // Level data
        const levels = [
            {
                platforms: [
                    { x: 0, y: 550, width: 800, height: 50 }, // Ground
                    { x: 200, y: 450, width: 150, height: 20 },
                    { x: 450, y: 350, width: 150, height: 20 },
                    { x: 650, y: 450, width: 150, height: 20 },
                    { x: 100, y: 300, width: 100, height: 20 },
                    { x: 350, y: 200, width: 100, height: 20 },
                ],
                enemies: [
                    { x: 220, y: 400, type: 'walker' },
                    { x: 470, y: 300, type: 'jumper' },
                ],
                coins: [
                    { x: 250, y: 410 },
                    { x: 500, y: 310 },
                    { x: 150, y: 260 },
                    { x: 400, y: 160 },
                ],
                goal: { x: 730, y: 370 }
            },
            {
                platforms: [
                    { x: 0, y: 550, width: 800, height: 50 },
                    { x: 150, y: 480, width: 100, height: 20 },
                    { x: 350, y: 450, width: 80, height: 20 },
                    { x: 530, y: 420, width: 80, height: 20 },
                    { x: 250, y: 350, width: 100, height: 20 },
                    { x: 450, y: 300, width: 100, height: 20 },
                    { x: 150, y: 250, width: 120, height: 20 },
                    { x: 600, y: 200, width: 150, height: 20 },
                ],
                enemies: [
                    { x: 170, y: 440, type: 'walker' },
                    { x: 370, y: 410, type: 'jumper' },
                    { x: 270, y: 310, type: 'shooter' },
                    { x: 620, y: 160, type: 'walker' },
                ],
                coins: [
                    { x: 180, y: 440 },
                    { x: 380, y: 410 },
                    { x: 300, y: 310 },
                    { x: 500, y: 260 },
                    { x: 650, y: 160 },
                    { x: 200, y: 210 },
                ],
                goal: { x: 700, y: 120 }
            },
            {
                platforms: [
                    { x: 0, y: 550, width: 150, height: 50 },
                    { x: 250, y: 550, width: 100, height: 50 },
                    { x: 450, y: 550, width: 100, height: 50 },
                    { x: 650, y: 550, width: 150, height: 50 },
                    { x: 100, y: 450, width: 80, height: 20 },
                    { x: 280, y: 400, width: 80, height: 20 },
                    { x: 480, y: 350, width: 80, height: 20 },
                    { x: 200, y: 300, width: 100, height: 20 },
                    { x: 400, y: 250, width: 100, height: 20 },
                    { x: 600, y: 200, width: 100, height: 20 },
                    { x: 300, y: 150, width: 200, height: 20 },
                ],
                enemies: [
                    { x: 270, y: 510, type: 'jumper' },
                    { x: 470, y: 510, type: 'jumper' },
                    { x: 300, y: 360, type: 'shooter' },
                    { x: 500, y: 310, type: 'walker' },
                    { x: 420, y: 210, type: 'shooter' },
                ],
                coins: [
                    { x: 120, y: 410 },
                    { x: 300, y: 360 },
                    { x: 500, y: 310 },
                    { x: 250, y: 260 },
                    { x: 450, y: 210 },
                    { x: 650, y: 160 },
                    { x: 350, y: 110 },
                    { x: 450, y: 110 },
                ],
                goal: { x: 680, y: 120 }
            }
        ];

        // Game objects
        let player;
        let enemies = [];
        let coins = [];
        let goal;
        let platforms = [];

        function initLevel(levelNum) {
            const levelData = levels[levelNum - 1];
            
            player = new Player(50, 300);
            platforms = levelData.platforms;
            
            enemies = levelData.enemies.map(e => new Enemy(e.x, e.y, e.type || 'walker'));
            coins = levelData.coins.map(c => new Coin(c.x, c.y));
            goal = new Goal(levelData.goal.x, levelData.goal.y);
            
            gameState.level = levelNum;
            updateUI();
        }

        function update() {
            if (!gameState.running || gameState.paused) return;

            if (player) player.update(platforms);
            
            if (enemies) {
                enemies.forEach(enemy => {
                    enemy.update(platforms);
                    
                    // Check player bullet hits on enemy
                    if (player) {
                        player.bullets = player.bullets.filter(bullet => {
                            if (enemy.active && bullet.x < enemy.x + enemy.width &&
                                bullet.x + bullet.width > enemy.x &&
                                bullet.y < enemy.y + enemy.height &&
                                bullet.y + bullet.height > enemy.y) {
                                enemy.takeDamage(1);
                                return false; // Remove bullet
                            }
                            return true;
                        });
                    }
                    
                    // Check enemy bullet hits on player
                    if (player && enemy.bullets) {
                        enemy.bullets = enemy.bullets.filter(bullet => {
                            if (bullet.x < player.x + player.width &&
                                bullet.x + bullet.width > player.x &&
                                bullet.y < player.y + player.height &&
                                bullet.y + bullet.height > player.y) {
                                player.takeDamage(1);
                                return false; // Remove bullet
                            }
                            return true;
                        });
                    }
                    
                    // Check collision with player
                    if (enemy.active && player && player.intersects(enemy)) {
                        // Check if player jumped on enemy
                        if (player.velocityY > 0 && player.y + player.height - player.velocityY <= enemy.y + 10) {
                            enemy.takeDamage(1);
                            player.velocityY = -8; // Bounce
                        } else if (!player.isSliding) {
                            player.takeDamage(1);
                        } else {
                            // Sliding through enemy kills it
                            enemy.takeDamage(1);
                        }
                    }
                });
            }

            if (coins) {
                coins.forEach(coin => {
                    coin.update();
                    if (!coin.collected && player && player.intersects(coin)) {
                        coin.collected = true;
                        gameState.coins++;
                        gameState.score += 10;
                        updateUI();
                    }
                });
            }

            if (goal) {
                goal.update();
                
                // Check goal collision
                if (player && player.intersects(goal)) {
                    levelComplete();
                }
            }
        }

        function draw() {
            // Clear screen
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            // Draw platforms
            if (platforms) {
                platforms.forEach(platform => {
                    ctx.fillStyle = '#8B4513';
                    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
                    
                    // Grass on top
                    ctx.fillStyle = '#228B22';
                    ctx.fillRect(platform.x, platform.y - 4, platform.width, 4);
                });
            }

            // Draw game objects
            if (coins) coins.forEach(coin => coin.draw());
            if (goal) goal.draw();
            if (enemies) enemies.forEach(enemy => enemy.draw());
            if (player) player.draw();
            
            // Update stamina bar continuously
            if (player) {
                const staminaBar = document.getElementById('staminaBar');
                if (staminaBar) {
                    const staminaPercent = (player.stamina / player.maxStamina) * 100;
                    staminaBar.style.width = staminaPercent + '%';
                    
                    if (staminaPercent < 30) {
                        staminaBar.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)';
                    } else if (staminaPercent < 60) {
                        staminaBar.style.background = 'linear-gradient(90deg, #f39c12, #e67e22)';
                    } else {
                        staminaBar.style.background = 'linear-gradient(90deg, #2ecc71, #27ae60)';
                    }
                }
            }

            // Pause overlay
            if (gameState.paused) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                ctx.fillStyle = '#fff';
                ctx.font = '48px Courier New';
                ctx.textAlign = 'center';
                ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
                ctx.font = '24px Courier New';
                ctx.fillText('Press ESC to resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
                ctx.textAlign = 'left';
            }
        }

        function gameLoop() {
            update();
            draw();
            requestAnimationFrame(gameLoop);
        }

        function updateUI() {
            document.getElementById('levelDisplay').textContent = gameState.level;
            document.getElementById('scoreDisplay').textContent = gameState.score;
            document.getElementById('coinsDisplay').textContent = gameState.coins;
            
            // Update health display
            const healthBar = document.getElementById('healthBar');
            healthBar.innerHTML = '';
            if (player) {
                for (let i = 0; i < player.maxHealth; i++) {
                    const heart = document.createElement('div');
                    heart.className = 'heart';
                    if (i >= player.health) {
                        heart.classList.add('empty');
                    }
                    healthBar.appendChild(heart);
                }
                
                // Update stamina bar
                const staminaBar = document.getElementById('staminaBar');
                if (staminaBar) {
                    const staminaPercent = (player.stamina / player.maxStamina) * 100;
                    staminaBar.style.width = staminaPercent + '%';
                    
                    // Change color based on stamina level
                    if (staminaPercent < 30) {
                        staminaBar.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)';
                    } else if (staminaPercent < 60) {
                        staminaBar.style.background = 'linear-gradient(90deg, #f39c12, #e67e22)';
                    } else {
                        staminaBar.style.background = 'linear-gradient(90deg, #2ecc71, #27ae60)';
                    }
                }
            }
        }

        function levelComplete() {
            gameState.score += 100;
            
            if (gameState.level >= gameState.maxLevel) {
                victory();
            } else {
                gameState.level++;
                initLevel(gameState.level);
            }
        }

        function victory() {
            gameState.running = false;
            const menu = document.getElementById('menu');
            const h1 = menu.querySelector('h1');
            h1.textContent = 'VICTORY!';
            h1.className = 'victory';
            menu.classList.remove('hidden');
            document.getElementById('startBtn').classList.add('hidden');
            document.getElementById('restartBtn').classList.remove('hidden');
        }

        function gameOver() {
            gameState.running = false;
            const menu = document.getElementById('menu');
            const h1 = menu.querySelector('h1');
            h1.textContent = 'GAME OVER';
            h1.className = 'game-over';
            menu.classList.remove('hidden');
            document.getElementById('startBtn').classList.add('hidden');
            document.getElementById('restartBtn').classList.remove('hidden');
        }

        function togglePause() {
            gameState.paused = !gameState.paused;
        }

        function startGame() {
            gameState = {
                running: true,
                paused: false,
                level: 1,
                score: 0,
                coins: 0,
                maxLevel: 3
            };
            
            initLevel(1);
            
            const menu = document.getElementById('menu');
            menu.classList.add('hidden');
            const h1 = menu.querySelector('h1');
            h1.textContent = 'PIXEL QUEST';
            h1.className = '';
        }

        // Event listeners
        document.getElementById('startBtn').addEventListener('click', startGame);
        document.getElementById('restartBtn').addEventListener('click', () => {
            document.getElementById('startBtn').classList.remove('hidden');
            document.getElementById('restartBtn').classList.add('hidden');
            startGame();
        });

        // Start game loop
        gameLoop();