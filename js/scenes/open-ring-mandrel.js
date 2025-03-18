(function () {
    var INITIAL_LEFT_POS = scrCenter.x - 5;
    var INITIAL_RIGHT_POS = scrCenter.x + 5;
    var HORIZONTAL_MAX_POS = 6;
    var TOP_POS = 125;
    var BOTTOM_POS = 100;
    var MAX_HAMMER_FORCE = 50;
    var MIN_HAMMER_FORCE = 16;
    var BREAK_HAMMER_FORCE = 30;
    var MAX_PARTICLES = 10;

    config.scene.push({
        key: 'open-ring-mandrel',
        preload: function() {
            this.load.audio('metal-hit', 'sound/metal-hit.mp3');
            this.load.audio('metal-hit-soft', 'sound/metal-hit-soft.mp3');
            this.load.audio('metal-hit-hollow', 'sound/metal-hit-hollow.mp3');
            this.load.audio('metal-breaking', 'sound/metal-breaking.mp3');

            this.load.image('spark', 'imgs/spark.png');
            
            this.load.image('popup-bgr', 'imgs/popup-bgr.png');
            this.load.image('txt-fail', 'imgs/txt-fail.png');
            this.load.image('txt-success', 'imgs/txt-success.png');
            this.load.image('btn-retry', 'imgs/btn-retry.png');
            this.load.image('btn-exit', 'imgs/btn-exit.png');

            this.load.image('mandrel', 'imgs/mandrel.png');
            this.load.image('mandrel-sizes-bgr', 'imgs/mandrel-sizes-bgr.png');
            this.load.spritesheet('open-ring-mandrel-left', 'imgs/open-ring-mandrel-left.png', { frameWidth: 39, frameHeight: 22 });
            this.load.spritesheet('open-ring-mandrel-right', 'imgs/open-ring-mandrel-right.png', { frameWidth: 39, frameHeight: 22 });
            this.load.image('rubber-hammer', 'imgs/rubber-hammer.png');
        },

        create: function () {
            this.add.tileSprite(scrCenter.x, scrCenter.y, config.width, config.height, "mandrel-sizes-bgr")
                .setTilePosition(0, (349 -  config.height) / 2 + 50);
            
            var txtConfig = { color: '#000', fontSize: 30 };
            var lineHeight = 34;
            this.add.text(scrCenter.x - 80, scrCenter.y - 50 - lineHeight * 2, "XS", txtConfig);
            this.add.text(scrCenter.x - 80, scrCenter.y - 50 - lineHeight, "S", txtConfig);
            this.add.text(scrCenter.x - 80, scrCenter.y - 50, "M", txtConfig);
            this.add.text(scrCenter.x - 80, scrCenter.y - 50 + lineHeight, "L", txtConfig);
            this.add.text(scrCenter.x - 80, scrCenter.y - 50 + lineHeight * 2, "XL", txtConfig);

            this.add.image(scrCenter.x, scrCenter.y, 'mandrel');
            this.ringLeft = this.add.sprite(INITIAL_LEFT_POS, scrCenter.y - TOP_POS, 'open-ring-mandrel-left');
            this.ringRight = this.add.sprite(INITIAL_RIGHT_POS, scrCenter.y - TOP_POS, 'open-ring-mandrel-right');
            this.ringLeft.setOrigin(0.6666, 0.181818);
            this.ringRight.setOrigin(0.3333, 0.181818);

            this.particleEmitter = this.add.particles(INITIAL_LEFT_POS - 10, scrCenter.y - TOP_POS, 'spark', {
                scale: { start: 1.5, end: 0.1 },
                alpha: { start: 1, end: 0 },
                speed: { min: 100, max: 400 },
                angle: { min: 0, max: 360 },
                lifespan: 150,
                quantity: 1,
                gravityY: 2000,
            }).stop();

            setRingDownPerc(this, 0.38);

            this.hammerLeftPressing = false;
            this.hammerLeftHasHit = false;
            this.hammeringLeft = false;
            this.hammerLeftForce = 0;
            this.add.circle(scrCenter.x - 100, scrCenter.y, 50, '0xff0000', 0.5)
                .setInteractive()
                .on('pointerdown', () => {
                    this.hammerLeftPressing = true;
                    this.hammerLeftHasHit = false;
                })
                .on('pointerout', () => {
                    this.hammerLeftPressing = false;
                    this.hammerLeftHasHit = false;
                })
                .on('pointerup', () => {
                    this.hammerLeftPressing = false;
                    this.hammerLeftHasHit = false;
                });

            this.hammerRightPressing = false;
            this.hammerRightHasHit = false;
            this.hammeringRight = false;
            this.hammerRightForce = 0;
            this.add.circle(scrCenter.x + 100, scrCenter.y, 50, '0xff0000', 0.5)
                .setInteractive()
                .on('pointerdown', () => {
                    this.hammerRightPressing = true;
                    this.hammerRightHasHit = false;
                })
                .on('pointerout', () => {
                    this.hammerRightPressing = false;
                    this.hammerRightHasHit = false;
                })
                .on('pointerup', () => {
                    this.hammerRightPressing = false;
                    this.hammerRightHasHit = false;
                });

            this.hammerLeft = this.add.image(scrCenter.x - 330, scrCenter.y + 80, 'rubber-hammer');
            this.hammerLeft.setFlip(true, false);
            this.hammerLeft.setOrigin(0, 1);
            this.hammerLeft.setScale(1.2);
            this.hammerLeft.setAlpha(0);

            this.hammerRight = this.add.image(scrCenter.x + 330, scrCenter.y + 80, 'rubber-hammer');
            this.hammerRight.setOrigin(1, 1);
            this.hammerRight.setScale(1.2);
            this.hammerRight.setAlpha(0);
            
            var popupY = 40;
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

            if (this.hammeringLeft) {
                this.hammerLeft.rotation += 0.6;

                if (this.hammerLeft.rotation >= 0) {
                    this.particleEmitter.x = INITIAL_LEFT_POS - 10;

                    if (this.hammerLeftForce > BREAK_HAMMER_FORCE) {
                        this.ringLeft.setFrame(this.ringLeft.texture.frames[5]);
                        this.sound.play('metal-breaking');
                        this.particleEmitter.quantity = MAX_PARTICLES;
                        this.particleEmitter.explode();
                        this.popupGroup.setActive(true).setVisible(true);
                        this.successTxt.setVisible(false);

                    } else if (this.hammerLeftForce > MIN_HAMMER_FORCE) {
                        this.particleEmitter.quantity = 1 
                            + MAX_PARTICLES 
                            * (BREAK_HAMMER_FORCE - (this.hammerLeftForce - MIN_HAMMER_FORCE))
                            / (BREAK_HAMMER_FORCE - MIN_HAMMER_FORCE);
                        this.particleEmitter.explode();

                        if (this.ringLeft.frame.name == 5) {
                            this.sound.play('metal-hit');

                        } else if (this.ringLeft.frame.name < 4) {
                            this.sound.play('metal-hit');

                            this.ringLeft.setFrame(this.ringLeft.texture.frames[this.ringLeft.frame.name + 1]);
                            if (this.ringRight.frame.name == 4 && this.ringLeft.frame.name == 4) {
                                this.popupGroup.setActive(true).setVisible(true);
                                this.failTxt.setVisible(false);
                            }

                        } else {
                            this.sound.play('metal-hit-hollow');
                        }

                    } else {
                        this.particleEmitter.quantity = 1;
                        this.particleEmitter.explode();

                        if (this.ringLeft.frame.name == 5) {
                            this.sound.play('metal-hit');
                        } else if (this.ringLeft.frame.name < 4) {
                            this.sound.play('metal-hit-soft');
                        } else {
                            this.sound.play('metal-hit-hollow');
                        }
                    }

                    this.hammerLeft.rotation = 0;
                    this.hammerLeftForce = 0;
                    this.hammeringLeft = false;

                    this.tweens.add({
                        targets: this.hammerLeft,
                        alpha: { from: 1, to: 0 },
                        ease: 'Quad.easeOut',
                        duration: 600,
                        repeat: 0,
                    });
                }
                return;
            }

            if (this.hammeringRight) {
                this.hammerRight.rotation -= 0.6;

                if (this.hammerRight.rotation <= 0) {

                    this.particleEmitter.x = INITIAL_RIGHT_POS + 10;

                    if (this.hammerRightForce > BREAK_HAMMER_FORCE) {
                        this.ringRight.setFrame(this.ringRight.texture.frames[5]);
                        this.sound.play('metal-breaking');
                        this.particleEmitter.quantity = MAX_PARTICLES;
                        this.particleEmitter.explode();
                        this.popupGroup.setActive(true).setVisible(true);
                        this.successTxt.setVisible(false);

                    } else if (this.hammerRightForce > MIN_HAMMER_FORCE) {
                        this.particleEmitter.quantity = 1 
                            + MAX_PARTICLES 
                            * (BREAK_HAMMER_FORCE - (this.hammerLeftForce - MIN_HAMMER_FORCE))
                            / (BREAK_HAMMER_FORCE - MIN_HAMMER_FORCE);
                        this.particleEmitter.explode();

                        if (this.ringRight.frame.name == 5) {
                            this.sound.play('metal-hit');
                        } else if (this.ringRight.frame.name < 4) {
                            this.sound.play('metal-hit');
                            this.ringRight.setFrame(this.ringRight.texture.frames[this.ringRight.frame.name + 1]);
                            
                            if (this.ringRight.frame.name == 4 && this.ringLeft.frame.name == 4) {
                                this.popupGroup.setActive(true).setVisible(true);
                                this.failTxt.setVisible(false);
                            }

                        } else {
                            this.sound.play('metal-hit-hollow');
                        }
                    } else {
                        this.particleEmitter.quantity = 1;
                        this.particleEmitter.explode();

                        if (this.ringRight.frame.name == 5) {
                            this.sound.play('metal-hit');
                        } else if (this.ringRight.frame.name < 4) {
                            this.sound.play('metal-hit-soft');
                        } else {
                            this.sound.play('metal-hit-hollow');
                        }
                    }

                    this.hammerRight.rotation = 0;
                    this.hammerRightForce = 0;
                    this.hammeringRight = false;

                    this.tweens.add({
                        targets: this.hammerRight,
                        alpha: { from: 1, to: 0 },
                        ease: 'Quad.easeOut',
                        duration: 600,
                        repeat: 0,
                    });
                }
                return;
            }

            if (this.hammerLeftPressing) {
                if (this.hammerLeftHasHit)
                    return;

                this.hammerLeft.setAlpha(1);
                this.hammerLeft.rotation -= 0.03;
                this.hammerLeftForce += 1;
                if (this.hammerLeftForce >= MAX_HAMMER_FORCE) {
                    this.hammeringLeft = true;
                    this.hammerLeftHasHit = true;
                }
            } else {
                if (this.hammerLeftForce > 0) {
                    this.hammerLeftHasHit = true;
                    this.hammeringLeft = true;
                }
            }

            if (this.hammerRightPressing) {
                if (this.hammerRightHasHit)
                    return;

                this.hammerRight.setAlpha(1);
                this.hammerRight.rotation += 0.03;
                this.hammerRightForce += 1;
                if (this.hammerRightForce >= MAX_HAMMER_FORCE) {
                    this.hammeringRight = true;
                    this.hammerRightHasHit = true;
                }
            } else {
                if (this.hammerRightForce > 0) {
                    this.hammerRightHasHit = true;
                    this.hammeringRight = true;
                }
            }
        }
    });

    function setRingDownPerc(game, ringDownPerc) {
        var y = (scrCenter.y - TOP_POS) 
            + ringDownPerc * (scrCenter.y + BOTTOM_POS - (scrCenter.y - TOP_POS));

        game.ringLeft.y = y;
        game.ringRight.y = y;
        game.particleEmitter.y = y;
        game.ringLeft.x = INITIAL_LEFT_POS - ringDownPerc * HORIZONTAL_MAX_POS;
        game.ringRight.x = INITIAL_RIGHT_POS + 2 + ringDownPerc * HORIZONTAL_MAX_POS;
    }

})();
