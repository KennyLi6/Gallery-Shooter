function collisionCheck(obj1, obj2) {
    if (Math.abs(obj1.x - obj2.x) > (obj1.displayWidth/2 + obj2.displayWidth/2)) {
        return false;
    }
    if (Math.abs(obj1.y - obj2.y) > (obj1.displayHeight/2 + obj2.displayHeight/2)) {
        return false;
    }
    return true;
}

class Shmup extends Phaser.Scene {
    constructor() {
        super("Shmup")
        this.my = {sprite: {}};
        this.x = 400;
        this.y = 550;
        this.gameActive = false;

        this.bulletCooldown = 20;
        this.bulletCooldownCounter = 0;
        this.killcount = 0;
        this.score = 0;
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.image("character", "character_roundGreen.png");
        this.load.image("bullet", "effect_blast.png");
        this.load.image("enemy", "duck_brown.png");
        this.load.image("elite", "duck_yellow.png");
        this.load.audio("quack", "single_quack.wav");
        this.load.audio("hit", "error_004.ogg");
        this.load.audio("fire", "close_002.ogg");
    }

    create() {
        let my = this.my;

        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        let rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        rKey.on('down', (key, event) => {
            this.init_game();
        })

        my.sprite.character = this.add.sprite(this.x, this.y, "character");

        my.sprite.bulletGroup = this.add.group({
            defaultKey: "bullet",
            maxSize: 10
        })

        my.sprite.bulletGroup.createMultiple({
            active: false,
            key: my.sprite.bulletGroup.defaultKey,
            repeat: my.sprite.bulletGroup.maxSize-1
        });

        my.sprite.enemyGroup = this.add.group({
            defaultKey: "enemy",
            maxSize: 20
        })

        my.sprite.enemyGroup.createMultiple({
            active: false,
            key: my.sprite.enemyGroup.defaultKey,
            repeat: my.sprite.enemyGroup.maxSize-1
        });

        my.sprite.eliteGroup = this.add.group({
            defaultKey: "elite",
            maxSize: 5
        })

        my.sprite.eliteGroup.createMultiple({
            active: false,
            key: my.sprite.eliteGroup.defaultKey,
            repeat: my.sprite.enemyGroup.maxSize-1
        });

        my.sprite.enemyBulletGroup = this.add.group({
            defaultKey: "bullet",
            maxSize: 5
        })

        my.sprite.enemyBulletGroup.createMultiple({
            active: false,
            key: my.sprite.enemyBulletGroup.defaultKey,
            repeat: my.sprite.bulletGroup.maxSize-1
        });

        this.text = this.add.text(400,200, "Score");
        this.text.setOrigin(0.5);
        this.init_game();

        this.playerSpeed = 5;
        this.bulletSpeed = 5;
        this.enemySpeed = 0.5;

        document.getElementById('description').innerHTML = '<h2>A: left | D: right | Space: fire | R: restart<h2>'
    }

    update() {
        let my = this.my;
        
        this.bulletCooldownCounter--;
        
        if (this.gameActive && this.aKey.isDown) {
            if (my.sprite.character.x > (my.sprite.character.displayWidth/2)) {
                my.sprite.character.x -= this.playerSpeed;
            }
        }
        if (this.gameActive && this.dKey.isDown) {
            if (my.sprite.character.x < (game.config.width - (my.sprite.character.displayWidth/2))) {
                my.sprite.character.x += this.playerSpeed;
            }
        }

        if (this.gameActive && this.spaceKey.isDown) {
            if (this.bulletCooldownCounter < 0) {
                let bullet = my.sprite.bulletGroup.getFirstDead();
                if (bullet != null) {
                    bullet.active = true;
                    bullet.visible = true;
                    bullet.x = my.sprite.character.x;
                    bullet.y = my.sprite.character.y - (my.sprite.character.displayHeight/2);
                    this.sound.play("fire", {
                        volume: .4
                    });
                    this.bulletCooldownCounter = this.bulletCooldown;
                }
            }
        }

        for (let bullet of my.sprite.bulletGroup.getChildren()) {
            if (bullet.y < -(bullet.displayHeight/2)) {
                bullet.active = false;
                bullet.visible = false;
            }
            if (bullet.active) {
                for (let enemy of my.sprite.enemyGroup.getChildren()) {
                    if (this.gameActive && collisionCheck(bullet, enemy)) {
                        bullet.active = false;
                        bullet.y = -100;
                        enemy.visible = false;
                        enemy.active = false;
                        enemy.x = -100;
                        this.score += enemy.score;
                        this.sound.play("quack", {
                            volume: 1
                        });
                        this.killcount++;
                    }
                }
                for (let enemy of my.sprite.eliteGroup.getChildren()) {
                    if (this.gameActive && collisionCheck(bullet, enemy)) {
                        bullet.active = false;
                        bullet.y = -100;
                        enemy.visible = false;
                        enemy.active = false;
                        enemy.x = -100;
                        this.score += enemy.score;
                        this.sound.play("quack", {
                            volume: 1
                        });
                        this.killcount++;
                    }
                }
            }
        }

        for (let enemy of my.sprite.enemyGroup.getChildren()) {
            if (this.gameActive == true && collisionCheck(my.sprite.character, enemy)) {
                my.sprite.character.health -= 1;
                enemy.visible = false;
                enemy.active = false;
                this.sound.play("hit", {
                    volume: 1
                });
            }
        }

        for (let enemy of my.sprite.eliteGroup.getChildren()) {
            if (this.gameActive == true && collisionCheck(my.sprite.character, enemy)) {
                my.sprite.character.health -= 1;
                enemy.visible = false;
                enemy.active = false;
                this.sound.play("hit", {
                    volume: 1
                });
            }
            if (this.gameActive && enemy.active) {
                enemy.cooldownCounter--;
                if (enemy.cooldownCounter < 0) {
                    let bullet = my.sprite.enemyBulletGroup.getFirstDead();
                    if (bullet != null) {
                        bullet.active = true;
                        bullet.visible = true;
                        bullet.x = enemy.x;
                        bullet.y = enemy.y + (enemy.displayHeight/2);
                        bullet.setScale(0.25);
                        enemy.cooldownCounter = Math.ceil(Math.random()*20);
                    }
                }
            }
            if (this.gameActive == true && collisionCheck(my.sprite.character, enemy)) {
                my.sprite.character.health -= 2;
                enemy.visible = false;
                enemy.active = false;
                this.sound.play("hit", {
                    volume: 1
                });
            }
        }

        for (let bullet of my.sprite.enemyBulletGroup.getChildren()) {
            if (bullet.y > game.config.height + (bullet.displayHeight/2)) {
                bullet.active = false;
                bullet.visible = false;
            }
            if (this.gameActive && bullet.active) {
                if (collisionCheck(bullet, my.sprite.character)) {
                    my.sprite.character.health -= 1;
                    bullet.active = false;
                    bullet.visible = false;
                    this.sound.play("hit", {
                        volume: 1
                    });
                }
            }
        }
        my.sprite.bulletGroup.incY(-this.bulletSpeed);
        my.sprite.enemyGroup.incY(this.enemySpeed);
        my.sprite.eliteGroup.incY(this.enemySpeed*(1/2));
        my.sprite.enemyBulletGroup.incY(this.bulletSpeed);

        if (my.sprite.character.health <= 0) {
            this.gameActive = false;
            my.sprite.character.visible = false;
            my.sprite.character.active = false;
        }
        if (this.killcount >= 21) {
            this.gameActive = false;
        }
        if (!this.gameActive) {
            this.text.text = "Game Over!\nScore " + this.score;
            this.text.visible = true;
        }
    }

    init_game() {
        let my = this.my;

        this.killcount = 0;
        this.score = 0;
        this.text.visible = false;
        my.sprite.character.setPosition(this.x, this.y);
        my.sprite.character.active = true;
        my.sprite.character.visible = true;

        let xIterator = 50;
        let yIterator = 60;

        for (let bullet of my.sprite.bulletGroup.getChildren()) {
            bullet.active = false;
            bullet.visible = false;
        }

        for (let bullet of my.sprite.enemyBulletGroup.getChildren()) {
            bullet.active = false;
            bullet.visible = false;
        }

        for (let enemySpawn of my.sprite.enemyGroup.getChildren()){
            enemySpawn.x = xIterator;
            enemySpawn.y = yIterator;
            enemySpawn.active = true;
            enemySpawn.visible = true;
            enemySpawn.score = 100;
            enemySpawn.setScale(0.5);
            if (xIterator + 100 > 1000) {
                xIterator = -50;
                yIterator += 60;
            }
            xIterator += 100;
        }

        xIterator = 200;
        yIterator = 0;

        for (let enemySpawn of my.sprite.eliteGroup.getChildren()){
            enemySpawn.x = xIterator;
            enemySpawn.y = yIterator;
            enemySpawn.active = true;
            enemySpawn.visible = true;
            enemySpawn.score = 200;
            enemySpawn.setScale(0.5);
            enemySpawn.cooldownCounter = Math.floor(Math.random()*this.bulletCooldown);
            xIterator += 100;
        }

        my.sprite.character.health = 3;
        this.gameActive = true;
    }
}