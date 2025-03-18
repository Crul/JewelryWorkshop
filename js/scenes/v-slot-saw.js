(function () {
    config.scene.push({
        key: 'v-slot-saw',
        preload: function() {
            this.load.audio('metal-sawing', 'sound/metal-sawing.mp3');
            this.load.audio('metal-breaking', 'sound/metal-breaking.mp3');
            this.load.audio('wire-breaking', 'sound/wire-breaking.mp3');
            
            this.load.image('popup-bgr', 'imgs/popup-bgr.png');
            this.load.image('txt-fail', 'imgs/txt-fail.png');
            this.load.image('txt-success', 'imgs/txt-success.png');
            this.load.image('btn-retry', 'imgs/btn-retry.png');
            this.load.image('btn-exit', 'imgs/btn-exit.png');

            this.load.image('table-bgr', 'imgs/table-bgr.png');
            this.load.image('v-slot-bench', 'imgs/v-slot-bench.png');
            this.load.image('coping-saw', 'imgs/coping-saw.png');            
        },
        create: function () {
            this.add.tileSprite(scrCenter.x, scrCenter.y - 200, config.width, 300, "table-bgr");            
            this.add.image(scrCenter.x, scrCenter.y - 17, 'v-slot-bench'); 
            this.copingSaw = this.add.image(scrCenter.x - 30, scrCenter.y, 'coping-saw');
            
            this.buttonPressing = false;
            this.refY = 0;
            this.currentY = 0;
            this.soundPlayed = false;
            this.sawPasses = 0;
            this.input.on('pointerdown', (ev) => {
                this.buttonPressing = true;
                this.refY = ev.position.y;
                this.currentY = ev.position.y;
            });
            this.input.on('pointermove', (ev) => {
                if (this.buttonPressing)
                    this.currentY = ev.position.y;
            });
            this.input.on('pointerup', () => {
                this.buttonPressing = false;
            });
            this.input.on('pointerout', () => {
                this.buttonPressing = false;
            });

            var popupY = 60;
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
            if (this.popupGroup.active)  {
                this.copingSaw.y = (scrCenter.y + 9 * this.copingSaw.y)/10;
                return;
            }
            
            if (this.buttonPressing) {
                var prevY = this.copingSaw.y;
                this.copingSaw.y = scrCenter.y - (this.refY - this.currentY);
                // console.log(this.copingSaw.y - prevY);
                if (this.copingSaw.y - prevY > 20) {
                    this.sound.play('metal-breaking');
                    this.sound.play('wire-breaking');
                    this.popupGroup.setActive(true).setVisible(true);
                    this.successTxt.setVisible(false);
                } else if (!this.soundPlayed && this.copingSaw.y - prevY > 5) {
                    this.sawPasses++;
                    this.sound.play('metal-sawing');
                    this.soundPlayed = true;
                    if (this.sawPasses > 4) {
                        this.popupGroup.setActive(true).setVisible(true);
                        this.failTxt.setVisible(false);
                    }
                } else if (this.copingSaw.y - prevY < -5) {
                    this.soundPlayed = false;
                }
            } else {
                this.copingSaw.y = (scrCenter.y + 9 * this.copingSaw.y)/10;
            }
        }
    });
})();
