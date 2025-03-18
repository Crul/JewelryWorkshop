(function () {
    config.scene.push({
        key: 'main',
        preload: function () { 
            this.load.image('btn-open-ring', 'imgs/btn-open-ring.png');
            this.load.image('btn-closed-ring', 'imgs/btn-closed-ring.png');
            this.load.image('btn-v-slot-saw', 'imgs/btn-v-slot-saw.png');
        },
        create: function () {
            var btns = [
                this.add.image(scrCenter.x, 60, 'btn-open-ring')
                    .setInteractive()
                    .on('pointerdown', () => {
                        this.scene.start('open-ring-mandrel');
                        btns[0].destroy();
                        btns[1].destroy();
                        btns[2].destroy();
                    }, this),

                this.add.image(scrCenter.x, 140, 'btn-closed-ring')
                    .setInteractive()
                    .on('pointerdown', () => {
                        this.scene.start('closed-ring-mandrel');
                        btns[0].destroy();
                        btns[1].destroy();
                        btns[2].destroy();
                    }, this),

                this.add.image(scrCenter.x, 220, 'btn-v-slot-saw')
                    .setInteractive()
                    .on('pointerdown', () => {
                        this.scene.start('v-slot-saw');
                        btns[0].destroy();
                        btns[1].destroy();
                        btns[2].destroy();
                    }, this),
            ]

            fadeOutSplash();
        },
        update: function () { }
    });
    
    function fadeOutSplash() {
        var fadeTarget = document.getElementById("splash");
        if (!fadeTarget)
            return;
        
        var fadeEffect = setInterval(function () {
            if (!fadeTarget.style.opacity) {
                fadeTarget.style.opacity = 1;
            }
            if (fadeTarget.style.opacity > 0) {
                fadeTarget.style.opacity -= 0.1;
            } else {
                fadeTarget.remove();
                clearInterval(fadeEffect);
            }
        }, 60);
    }
})();
