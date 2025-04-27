(function () {
    const INITIAL_ANGLE_DEG = 135;
    const INITIAL_ANGLE_RAD = Phaser.Math.DegToRad(INITIAL_ANGLE_DEG);
    const NINETY_DEG_IN_RAD = Phaser.Math.DegToRad(90);
    const MANDREL_WIDTH = 20;
    const PAN_LEFT = 20;
    const MAX_ACCUMULATED_ERROR = 70;
    const SAFE_DISTANCE_MARGIN = 5;
    
    config.scene.push({
        key: 'pliers',
        preload: function() {
            this.load.audio('bending', 'sound/bending.mp3');

            this.load.image('pliers-left', 'imgs/pliers-left.png');
            this.load.image('pliers-right', 'imgs/pliers-right.png');

            this.load.image('popup-bgr', 'imgs/popup-bgr.png');
            this.load.image('txt-fail', 'imgs/txt-fail.png');
            this.load.image('txt-success', 'imgs/txt-success.png');
            this.load.image('btn-retry', 'imgs/btn-retry.png');
            this.load.image('btn-exit', 'imgs/btn-exit.png');
        },
        create: function () {
            this.bendingSound = this.sound.add('bending', { loop: true, volume: 0.2, rate: 0.9 });
            this.bendingSoundTarget = { volume: 0.2, rate: 1, detune: 0 };

            this.graphics = this.add.graphics();
            
            this.isWirePlied = false;
            this.pliersTargetData = {
                pos: {x: scrCenter.x + PAN_LEFT + 20, y: scrCenter.y - 50},
                rotation: 0,
                closedness: 0
            };
            this.pliersLeft = this.add.image(0, 0, 'pliers-left').setOrigin(0.8222, 0.2795);
            this.pliersRight = this.add.image(0, 0, 'pliers-right').setOrigin(0.221, 0.2795);
            
            this.pliersContainer = this.add.container(scrCenter.x + PAN_LEFT + 20, scrCenter.y - 50)
                .add([ this.pliersLeft, this.pliersRight ]);
            
            this.lastPointerPos = getWireTipPos(INITIAL_ANGLE_RAD);
            this.pointerPos = this.lastPointerPos;
            this.endAngle = getEndAngleRad(this.pointerPos);
            this.buttonPressing = false;
            this.accumulatedError = 0;
            dragWire = (pointer, dragX, dragY) => {
                if (this.popupGroup.active)
                     return;

                this.pointerPos = pointer.position;
                this.endAngle = getEndAngleRad(pointer.position);
                this.bendingSoundTarget.detune = 1000 * (this.endAngle - 2.35) / (7 - 2.35);
            };
            dragStartWire = (pointer, dragX, dragY) => {
                if (this.popupGroup.active)
                     return;
                this.buttonPressing = true;
                this.accumulatedError = 0;
                this.pointerPos = pointer.position;
                this.endAngle = getEndAngleRad(pointer.position);
                
                this.pliersTargetData.closedness = 1;
            };
            dragEndWire = (pointer, dragX, dragY) => {
                this.bendingSound.stop();
                this.buttonPressing = false;
                this.pliersTargetData.closedness = 0;
                this.isWirePlied = false;
                this.button.fillColor = 0x0000ff;
            };

            this.button = this.add.circle(scrCenter.x + PAN_LEFT, scrCenter.y, 20, 0x0000ff, 0.5)
                .setInteractive({ draggable: true })
                .on('drag', dragWire)
                .on('dragstart', dragStartWire)
                .on('dragend', dragEndWire);

            this.renderWire = renderWire;
            this.wire = this.renderWire();

            var popupY = -80;
            var popupBgr = this.add.image(scrCenter.x + PAN_LEFT, scrCenter.y + popupY, 'popup-bgr');

            this.successTxt = this.add
                .image(scrCenter.x + PAN_LEFT, scrCenter.y + popupY - 18, 'txt-success')
                .setVisible(false);

            this.failTxt = this.add
                .image(scrCenter.x + PAN_LEFT, scrCenter.y + popupY - 18, 'txt-fail')
                .setVisible(false);

            this.popupGroup = this.add.group([
                popupBgr, this.successTxt, this.failTxt,
                this.add.image(scrCenter.x + PAN_LEFT - 36, scrCenter.y + popupY + 18, 'btn-retry')
                    .setInteractive()
                    .on('pointerdown', () => {
                        this.game.sound.stopAll();
                        this.scene.restart();
                    }),
                this.add.image(scrCenter.x + PAN_LEFT + 36, scrCenter.y + popupY + 18, 'btn-exit')
                    .setInteractive()
                    .on('pointerdown', () => {
                        this.game.sound.stopAll();
                        this.scene.start('main');
                    }),
            ]).setActive(false).setVisible(false);

        },
        update: function (t, framerate) {
            if (this.bendingSound.volume > 0) {
                this.bendingSound.setVolume((9 * this.bendingSound.volume + this.bendingSoundTarget.volume) / 10);
                if (this.bendingSound.volume < 0.05) {
                    this.bendingSound.setVolume(0);
                }
            }

            if (this.popupGroup.active) {
                if (this.bendingSound.volume < 0.05) {
                    this.bendingSound.stop();
                }
                return;
            }

            this.bendingSound.setRate((9 * this.bendingSound.rate + this.bendingSoundTarget.rate) / 10);
            this.bendingSound.setDetune((9 * this.bendingSound.detune + this.bendingSoundTarget.detune) / 10);

            var deltaWireX = this.wire.end.x - this.wire.start.x;
            var deltaWireY = this.wire.end.y - this.wire.start.y;
            var wireDirection = new Phaser.Math.Vector2(deltaWireX, deltaWireY).normalize();
            var wireAngle = Math.atan2(deltaWireY, deltaWireX) - Math.PI / 2 + 0.03;
            while (wireAngle < 0) wireAngle += 2 * Math.PI;
            while (wireAngle > 2 * Math.PI) wireAngle -= 2 * Math.PI;

            var pliersAngle = this.pliersContainer.rotation;
            while (pliersAngle < 0) pliersAngle += 2 * Math.PI;
            while (pliersAngle > 2 * Math.PI) pliersAngle -= 2 * Math.PI;
            var totalDeltaAngle = (wireAngle - pliersAngle);

            if (!this.buttonPressing) {
                var totalDeltaPosX = this.wire.end.x + 50 * wireDirection.x - this.pliersContainer.x;
                var totalDeltaPosY = this.wire.end.y + 50 * wireDirection.y - this.pliersContainer.y;
                var deltaPosX = totalDeltaPosX / 10;
                var deltaPosY = totalDeltaPosY / 10;
                var deltaAngle = totalDeltaAngle / 10;
                this.pliersContainer.x += deltaPosX;
                this.pliersContainer.y += deltaPosY;
                this.pliersContainer.rotation += deltaAngle;
                this.pliersLeft.rotation *= 0.9;
                this.pliersRight.rotation *= 0.9;
            } else {
                var totalDeltaPosX = this.wire.end.x 
                    + (28 + 15 * this.accumulatedError / MAX_ACCUMULATED_ERROR) * wireDirection.x 
                    - this.pliersContainer.x;
                var totalDeltaPosY = this.wire.end.y 
                    + (28 + 15 * this.accumulatedError / MAX_ACCUMULATED_ERROR) * wireDirection.y 
                    - this.pliersContainer.y;

                if (!this.isWirePlied) {
                    var deltaPosX = totalDeltaPosX / 10;
                    var deltaPosY = totalDeltaPosY / 10;
                    var deltaAngle = totalDeltaAngle / 10;
                    this.pliersContainer.x += deltaPosX;
                    this.pliersContainer.y += deltaPosY;
                    this.pliersContainer.rotation += deltaAngle;

                    if (Math.abs(deltaPosX) + Math.abs(deltaPosY) < 1 && Math.abs(deltaAngle) < 0.1) {
                        var pliersLeftDeltaRot = (
                            -this.pliersTargetData.closedness * 0.31 - this.pliersLeft.rotation
                        ) / 5;
                        var pliersRightDeltaRot = (
                            this.pliersTargetData.closedness * 0.31 - this.pliersRight.rotation
                        ) / 5;
                        this.pliersLeft.rotation += pliersLeftDeltaRot;
                        this.pliersRight.rotation += pliersRightDeltaRot;

                        if (Math.abs(pliersRightDeltaRot) < 0.001) {
                            this.bendingSound.play();
                            this.isWirePlied = true;
                            this.button.fillColor = 0x00ff00;
                        }
                    }
                } else {
                    this.pliersContainer.x += totalDeltaPosX;
                    this.pliersContainer.y += totalDeltaPosY;
                    this.pliersContainer.rotation += totalDeltaAngle;
                    this.wire = this.renderWire();

                    var error = 0 * Math.max(0,
                        Phaser.Math.Distance.BetweenPoints(this.wire.end, this.pointerPos) 
                        - SAFE_DISTANCE_MARGIN
                    );

                    var distanceMoved = Math.sqrt(
                        (this.pointerPos.x - this.lastPointerPos.x) ** 2
                        + (this.pointerPos.y - this.lastPointerPos.y) ** 2
                    );
                    if (distanceMoved == 0) {
                        this.bendingSoundTarget.volume = 0;
                    } else {
                        this.bendingSoundTarget.volume = 0.2;
                        this.bendingSoundTarget.rate = 0.7 + 0.2 * (distanceMoved / 10);
                    }
                    this.lastPointerPos = { x: this.pointerPos.x, y: this.pointerPos.y };

                    this.accumulatedError += error;
                    this.button.fillColor = Phaser.Display.Color
                        .HSLToColor(Phaser.Math.Linear(2/6, 0, this.accumulatedError / MAX_ACCUMULATED_ERROR), 1, 0.5)
                        .color;

                    if (this.accumulatedError > MAX_ACCUMULATED_ERROR) {
                        this.bendingSound.stop();
                        this.buttonPressing = false;
                        this.isWirePlied = false;
                        this.button.fillColor = 0x0000ff;
                    }

                    if (this.endAngle > 7) {
                        this.popupGroup.setActive(true).setVisible(true);
                        this.failTxt.setVisible(false);
                        this.bendingSoundTarget.volume = 0;
                    }
                }
            }

            // this.graphics.lineStyle(10, 0x888888, 1);
            // this.curve.draw(this.graphics);
            // this.graphics.lineStyle(8, 0xAAAAAA, 1);
            // this.curve.draw(this.graphics);
            // this.graphics.lineStyle(6, 0xCCCCCC, 1);
            // this.curve.draw(this.graphics);
            // this.graphics.lineStyle(4, 0xDDDDDD, 1);
            // this.curve.draw(this.graphics);
            // this.graphics.lineStyle(2, 0xEEEEEE, 1);
            // this.curve.draw(this.graphics);
        }
    });

    function renderWire() {
        this.graphics.clear();
        this.graphics.lineStyle(4, 0xff00ff, 1);
        this.graphics.beginPath();
        this.graphics.arc(scrCenter.x + PAN_LEFT, scrCenter.y, MANDREL_WIDTH, INITIAL_ANGLE_RAD, this.endAngle);
        var wireTipPos = getWireTipPos(this.endAngle);
        this.graphics.lineTo(wireTipPos.x, wireTipPos.y);
        this.graphics.strokePath();
        this.button.setPosition(wireTipPos.x, wireTipPos.y);
        return {
            start: {
                x: scrCenter.x + PAN_LEFT + MANDREL_WIDTH * Math.cos(this.endAngle), 
                y: scrCenter.y + MANDREL_WIDTH * Math.sin(this.endAngle)
            },
            end: wireTipPos,
        }
    }

    function getWireTipPos(endAngleRad) {
        var middleX = scrCenter.x + PAN_LEFT + Math.cos(endAngleRad) * MANDREL_WIDTH;
        var middleY = scrCenter.y + Math.sin(endAngleRad) * MANDREL_WIDTH;
        var totalLength = 0.75 * 2 * Math.PI * MANDREL_WIDTH;
        var arcLength = (endAngleRad - INITIAL_ANGLE_RAD) * MANDREL_WIDTH;
        var straightWireLength = totalLength - arcLength;
        var tipAngle = endAngleRad + NINETY_DEG_IN_RAD;
        var finalX = middleX + Math.cos(tipAngle) * straightWireLength;
        var finalY = middleY + Math.sin(tipAngle) * straightWireLength;
        return { x: finalX, y: finalY };
    }

    // https://chat.deepseek.com/a/chat/s/3629efcf-06af-4a63-97f4-af08015f36c4
    function getEndAngleRad(mousePosition) {
        const dx = scrCenter.x - mousePosition.x;
        const dy = scrCenter.y - mousePosition.y;
        const phi = Math.atan2(dy, dx);
        
        let low = INITIAL_ANGLE_RAD;
        let high = 9 * Math.PI / 4;
        const epsilon = 1e-4;
        let bestTheta = INITIAL_ANGLE_RAD;
        for (let i = 0; i < 50; i++) {
            const mid = (low + high) / 2;
            const tipPos = getWireTipPos(mid);
            const tipDx = scrCenter.x - tipPos.x;
            const tipDy = scrCenter.y - tipPos.y;
            const tipPhi = Math.atan2(tipDy, tipDx);
            
            let delta = phi - tipPhi;
            // Normalize delta to the range [-π, π]
            while (delta > Math.PI) {
                delta -= 2 * Math.PI;
            } 
            while (delta < -Math.PI) {
                delta += 2 * Math.PI;
            }
            
            if (Math.abs(delta) < epsilon) {
                bestTheta = mid;
                break;
            }
            
            if (delta < 0) {
                // tipPhi is behind phi, need to increase tipPhi by decreasing theta
                high = mid;
            } else {
                // tipPhi is ahead of phi, need to decrease tipPhi by increasing theta
                low = mid;
            }
            bestTheta = mid;
        }
        // Clamp the result to the valid range
        bestTheta = Math.max(INITIAL_ANGLE_RAD, Math.min(bestTheta, 9 * Math.PI / 4));
        return bestTheta;
    }
})();
