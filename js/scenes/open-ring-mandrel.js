(function () {
    var INITIAL_LEFT_POS = scrCenter.x - 5;
    var INITIAL_RIGHT_POS = scrCenter.x + 5;
    var HORIZONTAL_MAX_POS = 6;
    var TOP_POS = scrCenter.y - 125;
    var BOTTOM_POS = 250;
    var MAX_HAMMER_FORCE = 50;
    var MIN_HAMMER_FORCE = 16;
    var BREAK_HAMMER_FORCE = 40;

    config.scene.push({
        key: 'open-ring-mandrel',
        description: "Open ring mandrel minigame",

        preload: function() {
            this.load.audio('metal-hit', 'sound/metal-hit.mp3');
            this.load.audio('metal-hit-soft', 'sound/metal-hit-soft.mp3');
            this.load.audio('metal-hit-hollow', 'sound/metal-hit-hollow.mp3');
            this.load.audio('metal-breaking', 'sound/metal-breaking.mp3');

            this.load.image('mandrel', 'imgs/mandrel.png');
            this.load.image('mandrel-sizes-bgr', 'imgs/mandrel-sizes-bgr.png');
            this.load.spritesheet('open-ring-mandrel-left', 'imgs/open-ring-mandrel-left.png', { frameWidth: 39, frameHeight: 22 });
            this.load.spritesheet('open-ring-mandrel-right', 'imgs/open-ring-mandrel-right.png', { frameWidth: 39, frameHeight: 22 });
            this.load.image('rubber-hammer', 'imgs/rubber-hammer.png');
        },

        create: function () {
            this.add.tileSprite(scrCenter.x, scrCenter.y, config.width, config.height, "mandrel-sizes-bgr")
                .setTilePosition(0, (349 -  config.height) / 2);
            
            var txtConfig = { color: '#000', fontSize: 30 };
            var lineHeight = 50;
            this.add.text(scrCenter.x - 80, scrCenter.y - lineHeight * 2, "XS", txtConfig);
            this.add.text(scrCenter.x - 80, scrCenter.y - lineHeight, "S", txtConfig);
            this.add.text(scrCenter.x - 80, scrCenter.y, "M", txtConfig);
            this.add.text(scrCenter.x - 80, scrCenter.y + lineHeight, "L", txtConfig);
            this.add.text(scrCenter.x - 80, scrCenter.y + lineHeight * 2, "XL", txtConfig);
                        
            this.add.image(scrCenter.x, scrCenter.y, 'mandrel');
            this.ringLeft = this.add.sprite(INITIAL_LEFT_POS, TOP_POS, 'open-ring-mandrel-left');
            this.ringRight = this.add.sprite(INITIAL_RIGHT_POS, TOP_POS, 'open-ring-mandrel-right');
            this.ringLeft.setOrigin(0.6666, 0.181818);
            this.ringRight.setOrigin(0.3333, 0.181818);

            setRingDownPerc(this, 0.45);

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
        },      

        update: function (t, framerate) {

            if (this.hammeringLeft) {
                this.hammerLeft.rotation += 0.6;

                if (this.hammerLeft.rotation >= 0) {
                        
                    if (this.hammerLeftForce > BREAK_HAMMER_FORCE) {
                        this.ringLeft.setFrame(this.ringLeft.texture.frames[5]);
                        this.sound.play('metal-breaking');

                    } else if (this.hammerLeftForce > MIN_HAMMER_FORCE) {
                        if (this.ringLeft.frame.name == 5) {
                            this.sound.play('metal-hit');
                        } else if (this.ringLeft.frame.name < 4) {
                            this.sound.play('metal-hit');
                            this.ringLeft.setFrame(this.ringLeft.texture.frames[this.ringLeft.frame.name + 1]);
                        } else {
                            this.sound.play('metal-hit-hollow');
                        }
                    } else {
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
                        
                    if (this.hammerRightForce > BREAK_HAMMER_FORCE) {
                        this.ringRight.setFrame(this.ringRight.texture.frames[5]);
                        this.sound.play('metal-breaking');

                    } else if (this.hammerRightForce > MIN_HAMMER_FORCE) {
                        if (this.ringRight.frame.name == 5) {
                            this.sound.play('metal-hit');
                        } else if (this.ringRight.frame.name < 4) {
                            this.sound.play('metal-hit');
                            this.ringRight.setFrame(this.ringRight.texture.frames[this.ringRight.frame.name + 1]);
                        } else {
                            this.sound.play('metal-hit-hollow');
                        }
                    } else {
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
        game.ringLeft.y = TOP_POS + ringDownPerc * (BOTTOM_POS - TOP_POS);
        game.ringRight.y = TOP_POS + ringDownPerc * (BOTTOM_POS - TOP_POS);
        game.ringLeft.x = INITIAL_LEFT_POS - ringDownPerc * HORIZONTAL_MAX_POS;
        game.ringRight.x = INITIAL_RIGHT_POS + 2 + ringDownPerc * HORIZONTAL_MAX_POS;
    }
    
})();
