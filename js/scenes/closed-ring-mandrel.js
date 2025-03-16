(function () {
    var TOP_POS = 125;
    var BOTTOM_POS = 250;
    var SCALE_BASE = 0.4;
    var SCALE_DELTA = 0.32;
    var MAX_HAMMER_FORCE = 50;
    var MIN_HAMMER_FORCE = 5;
    var BREAK_HAMMER_FORCE = 30;
    config.scene.push({
        key: 'closed-ring-mandrel',
        description: "Closed ring mandrel minigame",
        preload: function() {
            this.load.audio('metal-hit', 'sound/metal-hit.mp3');
            this.load.audio('metal-hit-soft', 'sound/metal-hit-soft.mp3');
            this.load.audio('metal-breaking', 'sound/metal-breaking.mp3');

            this.load.image('popup-bgr', 'imgs/popup-bgr.png');
            this.load.image('txt-fail', 'imgs/txt-fail.png');
            this.load.image('txt-success', 'imgs/txt-success.png');
            this.load.image('btn-retry', 'imgs/btn-retry.png');
            this.load.image('btn-exit', 'imgs/btn-exit.png');

            this.load.image('mandrel', 'imgs/mandrel.png');
            this.load.image('mandrel-sizes-bgr', 'imgs/mandrel-sizes-bgr.png');
            this.load.image('ring-mandrel', 'imgs/ring-mandrel.png');
            this.load.image('rubber-hammer', 'imgs/rubber-hammer.png');
        },
        create: function () {
            this.add.tileSprite(scrCenter.x, scrCenter.y, config.width, config.height, "mandrel-sizes-bgr")
                .setTilePosition(0, (349 -  config.height) / 2 + 25);
            
            var txtConfig = { color: '#000', fontSize: 30 };
            var lineHeight = 34;
            this.add.text(scrCenter.x - 80, scrCenter.y - 25 - lineHeight * 2, "XS", txtConfig);
            this.add.text(scrCenter.x - 80, scrCenter.y - 25 - lineHeight, "S", txtConfig);
            this.add.text(scrCenter.x - 80, scrCenter.y - 25, "M", txtConfig);
            this.add.text(scrCenter.x - 80, scrCenter.y - 25 + lineHeight, "L", txtConfig);
            this.add.text(scrCenter.x - 80, scrCenter.y - 25 + lineHeight * 2, "XL", txtConfig);
            
            this.add.image(scrCenter.x, scrCenter.y, 'mandrel');
            this.ring = this.add.image(scrCenter.x + 1, scrCenter.y - TOP_POS, 'ring-mandrel');
            this.ring.setScale(SCALE_BASE);
            
            this.hammer = this.add.image(scrCenter.x + 310, scrCenter.y - 30, 'rubber-hammer');
            this.hammer.setOrigin(1, 1);
            this.hammer.setScale(1.2);
            
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
            
            var popupY = -80;
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
            
            if (this.hammering) {
                this.hammer.rotation -= 0.5;
                if (this.hammer.rotation <= 0) {
                    if (this.hammerForce > BREAK_HAMMER_FORCE) {
                        this.ring.setVisible(false);
                        this.sound.play('metal-breaking');
                        this.popupGroup.setActive(true).setVisible(true);
                        this.successTxt.setVisible(false);

                    } else if (this.hammerForce > MIN_HAMMER_FORCE) {
                        this.sound.play('metal-hit');

                        this.ring.y += 3 * this.hammerForce;
                        this.hammer.y += 3 * this.hammerForce;
                        
                        var ringDownPerc =
                            (this.ring.y - (scrCenter.y - TOP_POS))
                            / (BOTTOM_POS - (scrCenter.y - TOP_POS));

                        this.ring.setScale(SCALE_BASE + ringDownPerc * SCALE_DELTA);
                        
                        //console.log(ringDownPerc);
                        
                        if (ringDownPerc > 0.5) {
                            this.popupGroup.setActive(true).setVisible(true);
                            if (ringDownPerc > 0.64) {
                                this.successTxt.setVisible(false);
                            } else {
                                this.failTxt.setVisible(false);
                            }
                        }

                    } else {
                        this.sound.play('metal-hit-soft');
                    }

                    this.hammer.rotation = 0;
                    this.hammerForce = 0;
                    this.hammering = false;
                }
                return;
            }
            
            if (this.buttonPressing) {
                if (this.hammerHasHit)
                    return;

                this.hammer.rotation += 0.03;
                this.hammerForce += 1;
                if (this.hammerForce > MAX_HAMMER_FORCE) {
                    this.hammering = true;
                    this.hammerHasHit = true;
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
