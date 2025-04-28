(function () {
    var HAMMER_Y_POS = 55;
    var MAX_HAMMER_FORCE = 50;
    var MIN_HAMMER_FORCE = 47;
    var MAX_PARTICLES = 10;
    var POWER_BAR_HEIGHT = 187;
    config.scene.push({
        key: 'disc-cutter',
        preload: function() {
            // TODO this.sound.add
            this.load.audio('metal-hit', 'sound/metal-hit.mp3');
            this.load.audio('metal-hit-soft', 'sound/metal-hit-soft.mp3');
            this.load.audio('metal-sheet-hit', 'sound/metal-sheet-hit.mp3');
            this.load.audio('metal-breaking', 'sound/metal-breaking.mp3');

            this.load.image('spark', 'imgs/spark.png');

            this.load.image('popup-bgr', 'imgs/popup-bgr.png');
            this.load.image('txt-fail', 'imgs/txt-fail.png');
            this.load.image('txt-success', 'imgs/txt-success.png');
            this.load.image('btn-retry', 'imgs/btn-retry.png');
            this.load.image('btn-exit', 'imgs/btn-exit.png');

            this.load.image('disc-cutter', 'imgs/disc-cutter.png');
            this.load.image('disc-cutter-cilinder', 'imgs/disc-cutter-cilinder.png');
            this.load.image('brass-hammer', 'imgs/brass-hammer.png');
            this.load.image('power-bar', 'imgs/power-bar.png');
        },
        create: function () {
            this.add.image(scrCenter.x + 50, scrCenter.y, 'power-bar');
            this.powerBar = this.add
                .rectangle(
                    scrCenter.x + 49,
                    scrCenter.y + POWER_BAR_HEIGHT / 2 - 14,
                    18, 0, 0xff0000
                ).setOrigin(0.5, 1);

            this.cilinder = this.add.image(scrCenter.x - 50, scrCenter.y, 'disc-cutter-cilinder');
            this.add.image(scrCenter.x - 50, scrCenter.y, 'disc-cutter');
            this.hammer = this.add.image(scrCenter.x + 180, scrCenter.y + HAMMER_Y_POS, 'brass-hammer');
            this.hammer.setOrigin(1, 1);
            this.hammer.setScale(1.2);
            
            this.particleEmitter = this.add.particles(scrCenter.x + 12 - 50, scrCenter.y - 50, 'spark', {
                scale: { start: 1.5, end: 0.1 },
                alpha: { start: 1, end: 0 },
                speed: { min: 100, max: 400 },
                angle: { min: 0, max: 360 },
                lifespan: 150,
                quantity: 1,
                gravityY: 2000,
            }).stop();
            
            this.forceUpOrDown = 1;

            this.buttonPressing = false;
            this.hammerHasHit = false;
            this.hammering = false;
            this.hammerForce = 0;
            this.input.on('pointerdown', () => {
                this.buttonPressing = true;
                this.hammerHasHit = false;
            });
            this.input.on('pointerup', () => {
                this.buttonPressing = false;
                this.hammerHasHit = false;
            });
            this.input.on('pointerout', () => {
                this.buttonPressing = false;
                this.hammerHasHit = false;
            });
            
            var popupY = -150;
            var popupBgr = this.add.image(scrCenter.x, scrCenter.y + popupY, 'popup-bgr');

            this.successTxt = this.add
                .image(scrCenter.x, scrCenter.y + popupY - 18, 'txt-success')
                .setVisible(false);
        
                this.failTxt = this.add
                .image(scrCenter.x, scrCenter.y + popupY - 18, 'txt-fail')
                .setVisible(false);

            this.popupGroup = this.add.group([
                popupBgr, this.successTxt, this.failTxt,
                this.add.image(scrCenter.x - 36, scrCenter.y + popupY + 18, 'btn-retry')
                    .setInteractive()
                    .on('pointerdown', () => this.scene.restart() ),
                this.add.image(scrCenter.x + 36, scrCenter.y + popupY + 18, 'btn-exit')
                    .setInteractive()
                    .on('pointerdown', () => this.scene.start('main') ),
            ]).setActive(false).setVisible(false);
        },
        update: function (t, framerate) {
            if (this.popupGroup.active)
                return;
            
            const powerPercentage = Math.pow(this.hammerForce, 8) / Math.pow(MAX_HAMMER_FORCE, 8);
            this.powerBar.height = -POWER_BAR_HEIGHT * powerPercentage;

            if (this.hammering) {
                this.hammer.rotation -= 0.5;
                this.hammer.y += 1 / 0.03;

                if (this.hammer.rotation <= 0) {
                    if (this.hammerForce > MIN_HAMMER_FORCE) {
                        this.sound.play('metal-sheet-hit');
                        this.particleEmitter.quantity = 1 
                            + MAX_PARTICLES 
                            * (MAX_HAMMER_FORCE - (this.hammerForce - MIN_HAMMER_FORCE))
                            / (MAX_HAMMER_FORCE - MIN_HAMMER_FORCE);

                        this.particleEmitter.explode();
                        
                        this.cilinder.y += 5;
                        this.popupGroup.setActive(true).setVisible(true);
                        this.failTxt.setVisible(false);

                    } else {
                        this.sound.play('metal-hit-soft');
                        this.particleEmitter.quantity = 1;
                        this.particleEmitter.explode();
                    }
                    this.hammer.y = scrCenter.y + HAMMER_Y_POS;
                    this.hammer.rotation = 0;
                    this.hammerForce = 0;
                    this.hammering = false;
                }
                return;
            }
            
            if (this.buttonPressing) {
                if (this.hammerHasHit)
                    return;

                this.hammer.rotation = powerPercentage * 1;
                this.hammer.y = scrCenter.y + HAMMER_Y_POS - 50 * powerPercentage;
                this.hammerForce += this.forceUpOrDown;
                
                if (this.hammerForce > MAX_HAMMER_FORCE) {
                    this.forceUpOrDown *= -1;
                    this.hammerForce = MAX_HAMMER_FORCE;

                } else if (this.hammerForce < 0) {
                    this.forceUpOrDown *= -1;
                    this.hammerForce = 0;
                }
            } else {
                if (this.hammerForce > 0) {
                    this.hammerHasHit = true;
                    this.hammering = true;
                }
            }
        }
    });
})();
