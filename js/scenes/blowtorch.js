(function () {
    config.scene.push({
        key: 'blowtorch',
        preload: function() {
            this.load.audio('blowtorch-turning-on', 'sound/blowtorch-turning-on.mp3');
            this.load.audio('blowtorch-loop', 'sound/blowtorch-loop.mp3');
            this.load.audio('hot-hissing', 'sound/hot-hissing.mp3');

            this.load.atlas('blowtorch-flame-atlas', 'imgs/blowtorch-flame.png', 'imgs/blowtorch-flame.json');
            this.load.atlas('ring-soldering-atlas', 'imgs/ring-soldering.png', 'imgs/ring-soldering.json');

            this.load.image('popup-bgr', 'imgs/popup-bgr.png');
            this.load.image('txt-fail', 'imgs/txt-fail.png');
            this.load.image('txt-success', 'imgs/txt-success.png');
            this.load.image('btn-retry', 'imgs/btn-retry.png');
            this.load.image('btn-exit', 'imgs/btn-exit.png');

            this.load.image('blowtorch', 'imgs/blowtorch.png');
        },
        create: function () {
            this.solderingProgress = 0;
            this.ringSolderingFrames = this.textures.get('ring-soldering-atlas').getFrameNames();
            var ringY = scrCenter.y + 50;
            this.ringCold = this.add.sprite(scrCenter.x, ringY, 'ring-soldering-atlas', this.ringSolderingFrames[0])
                .setScale(1.5);
            this.ringHot = this.add.sprite(scrCenter.x, ringY, 'ring-soldering-atlas', this.ringSolderingFrames[1])
                .setAlpha(0)
                .setScale(1.5);
            this.solderBottom = this.add.sprite(scrCenter.x, ringY, 'ring-soldering-atlas', this.ringSolderingFrames[2])
                .setScale(1.5);
            this.solderTop = this.add.sprite(scrCenter.x, ringY, 'ring-soldering-atlas', this.ringSolderingFrames[3])
                .setAlpha(0)
                .setScale(1.5);

            this.blowtorch = this.add.image(-125, -50, 'blowtorch')
                .setOrigin(0.018, 0.0694);

            this.anims.create({
                key: 'blowtorch-flame-dark',
                frames: this.anims.generateFrameNames('blowtorch-flame-atlas', { prefix: 'dark', end: 2, zeroPad: 4 }),
                repeat: -1
            });

            this.anims.create({
                key: 'blowtorch-flame-light',
                frames: this.anims.generateFrameNames('blowtorch-flame-atlas', { prefix: 'light', end: 2, zeroPad: 4 }),
                repeat: -1
            });

            this.flameDark = this.add.sprite(-125, -50, 'blowtorch-flame-dark-sprite')
                .setOrigin(1.05, 0.5)
                .setAlpha(0.5)
                .setScale(0.9, 1)
                .play('blowtorch-flame-dark');

            this.flameLight = this.add.sprite(-125, -50, 'blowtorch-flame-light-sprite')
                .setOrigin(1, 0.5)
                .setAlpha(0.5)
                .setScale(0.7, 1)
                .play('blowtorch-flame-light');

            this.hotHissingSound = this.sound.add('hot-hissing');
            this.blowtorchTurningOnSound = this.sound.add('blowtorch-turning-on');
            this.blowtorchLoopSound = this.sound.add('blowtorch-loop');
            this.blowtorching = false;
            this.pointerTarget = {x:0, y:0};
            this.burningTimer = 0;
            dragBlowtorch = (pointer, dragX, dragY) => {
                if (this.popupGroup.active)
                     return;
                this.pointerTarget = pointer.position;
            };
            dragStartBlowtorch = (pointer, dragX, dragY) => {
                if (this.popupGroup.active)
                     return;
                this.pointerTarget = pointer.position;
                this.blowtorching = true;
                this.blowtorchTurningOnSound.stop();
                this.blowtorchTurningOnSound.play({ volume: 1 });
                this.blowtorchLoopSound.setVolume(1);
            };
            dragEndBlowtorch = (pointer, dragX, dragY) => {
                if (this.popupGroup.active)
                     return;
                this.blowtorching = false;
                this.blowtorchTurningOnSound.stop();
                this.blowtorchLoopSound.setVolume(0.2);
            };

            this.blowtorchContainer = this.add.container(scrCenter.x + 120, scrCenter.y - 50)
                .add([ this.flameDark, this.flameLight, this.blowtorch ])
                .setRotation(-0.4)
                .setSize(10000, 10000)
                .setInteractive({ draggable: true })
                .on('drag', dragBlowtorch)
                .on('dragstart', dragStartBlowtorch)
                .on('dragend', dragEndBlowtorch);

            this.blowtorchTransfMatrix = new Phaser.GameObjects.Components
                .TransformMatrix().scale(1, 4).rotate(1).translate(-138 - scrCenter.x, 137 - ringY);

            this.blowtorchTurningOnSound.play({ volume: 0.2 });
            this.blowtorchLoopSound.play(
                { loop: true, delay: this.blowtorchTurningOnSound.duration, volume: 0.2 });

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
                    .on('pointerdown', () => {
                        this.game.sound.stopAll();
                        this.scene.restart();
                    }),
                this.add.image(scrCenter.x + 36, scrCenter.y + popupY + 18, 'btn-exit')
                    .setInteractive()
                    .on('pointerdown', () => {
                        this.game.sound.stopAll();
                        this.scene.start('main');
                    }),
            ]).setActive(false).setVisible(false);

        },
        update: function (t, framerate) {
            if (this.popupGroup.active) {
                this.blowtorchContainer.rotation =
                    (4 * this.blowtorchContainer.rotation - 0.4) / 5;

                this.flameDark.alpha -= 0.004;
                this.flameLight.alpha -= 0.004;

                this.blowtorchLoopSound.volume = Math.max(0, this.blowtorchLoopSound.volume - 0.002);
                if (this.blowtorchLoopSound.volume == 0)
                    this.game.sound.stopAll();

                return;
            }

            this.flameDark.play('blowtorch-flame-dark', { randomFrame: true });
            this.flameLight.play('blowtorch-flame-light', { randomFrame: true });

            if (this.blowtorching) {
                this.blowtorchContainer.x =
                    (6 * this.blowtorchContainer.x + (this.pointerTarget.x + 112)) / 7;

                this.blowtorchContainer.y =
                    (6 * this.blowtorchContainer.y + (this.pointerTarget.y - 80)) / 7;

                this.blowtorchContainer.rotation =
                    (4 * this.blowtorchContainer.rotation - 1) / 5;
            } else {
                this.blowtorchContainer.rotation =
                    (4 * this.blowtorchContainer.rotation - 0.4) / 5;
            }

            switch (this.solderingProgress) {
                case 0:
                    this.solderingProgress++;
                    break;
                case 1:
                    if (this.blowtorching) {
                        var refPoint = this.blowtorchTransfMatrix
                            .transformPoint(this.blowtorchContainer.x, this.blowtorchContainer.y);
                        if (refPoint.x > -55 && refPoint.y > -80 && refPoint.y < 80) {
                            var heatDistance = new Phaser.Math.Vector2(refPoint).length();
                            var heat = 0.02 / heatDistance;
                            this.ringHot.alpha += heat;
                            this.solderTop.alpha += heat;
                            if (this.solderTop.alpha >= 1) {
                                this.solderBottom.setFrame(this.ringSolderingFrames[3]);
                                this.solderTop.setFrame(this.ringSolderingFrames[4]).setAlpha(0);
                                this.solderingProgress++;
                            }
                        } else {
                            this.ringHot.alpha = Math.max(0, this.ringHot.alpha * 0.98);
                            this.solderTop.alpha = Math.max(0, this.solderTop.alpha * 0.98);
                        }
                    } else {
                        this.ringHot.alpha = Math.max(0, this.ringHot.alpha * 0.98);
                        this.solderTop.alpha = Math.max(0, this.solderTop.alpha * 0.98);
                    }
                    break;
                case 2:
                    this.solderBottom.alpha -= 0.1;
                    this.solderTop.alpha += 0.1;
                    if (this.solderTop.alpha >= 1) {
                        this.solderBottom.setFrame(this.ringSolderingFrames[4]).setAlpha(1);
                        this.solderTop.setFrame(this.ringSolderingFrames[5]).setAlpha(0);
                        this.solderingProgress++;
                        this.hotHissingSound.play();
                    }
                    break;
                case 3:
                    this.solderBottom.alpha -= 0.075;
                    this.solderTop.alpha += 0.075;
                    if (this.solderTop.alpha >= 1) {
                        this.solderBottom.setFrame(this.ringSolderingFrames[5]).setAlpha(1);
                        this.solderTop.setFrame(this.ringSolderingFrames[6]).setAlpha(0);
                        this.solderingProgress++;
                    }
                    break;
                case 4:
                    this.solderBottom.alpha -= 0.05;
                    this.solderTop.alpha += 0.05;
                    if (this.solderTop.alpha >= 1) {
                        this.solderBottom.setFrame(this.ringSolderingFrames[6]).setAlpha(1);
                        this.solderTop.setFrame(this.ringSolderingFrames[7]).setAlpha(0);
                        this.solderTop.alpha = 0.05;
                        this.solderingProgress++;
                    }
                    break;
                case 5:
                    if (this.blowtorching) {
                        var refPoint = this.blowtorchTransfMatrix
                            .transformPoint(this.blowtorchContainer.x, this.blowtorchContainer.y);
                        if (refPoint.x > -55 && refPoint.y > -80 && refPoint.y < 80) {
                            var heatDistance = new Phaser.Math.Vector2(refPoint).length();
                            var heat = 0.1 / heatDistance;
                            this.ringHot.alpha = Math.min(1, this.ringHot.alpha + heat);
                            this.solderTop.alpha = 1 - this.ringHot.alpha;
                            if (this.ringHot.alpha >= 0.99) {
                                this.burningTimer++;
                                if (this.burningTimer > 50){
                                    this.blowtorchLoopSound.setVolume(0.2);
                                    this.popupGroup.setActive(true).setVisible(true);
                                    this.successTxt.setVisible(false);
                                }
                            }
                        } else {
                            this.burningTimer = 0;
                            this.ringHot.alpha = Math.max(0, this.ringHot.alpha * 0.97);
                            this.solderTop.alpha = 1 - this.ringHot.alpha;
                            if (this.solderTop.alpha >= 0.99) {
                                this.blowtorchLoopSound.setVolume(0.2);
                                this.popupGroup.setActive(true).setVisible(true);
                                this.failTxt.setVisible(false);
                            }
                        }
                    } else {
                        this.burningTimer = 0;
                        this.ringHot.alpha = Math.max(0, this.ringHot.alpha * 0.97);
                        this.solderTop.alpha = 1 - this.ringHot.alpha;
                        if (this.solderTop.alpha >= 0.99) {
                            this.blowtorchLoopSound.setVolume(0.2);
                            this.popupGroup.setActive(true).setVisible(true);
                            this.failTxt.setVisible(false);
                        }
                    }
                    break;
                default:
                    break;
            }
        }
    });
})();
