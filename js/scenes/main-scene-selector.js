(function () {
    config.scene.push({
        key: 'main',
        preload: function () {
            this.load.image('btn-open-ring', 'imgs/btn-open-ring.png');
            this.load.image('btn-closed-ring', 'imgs/btn-closed-ring.png');
            this.load.image('btn-v-slot-saw', 'imgs/btn-v-slot-saw.png');
            this.load.image('btn-blowtorch', 'imgs/btn-blowtorch.png');
            this.load.image('btn-pliers', 'imgs/btn-pliers.png');
            this.load.image('btn-disc-cutter', 'imgs/btn-disc-cutter.png');
        },
        create: function () {
            var btns = [
                this.add.image(scrCenter.x - 50, 60, 'btn-open-ring')
                    .setInteractive()
                    .on('pointerdown', () => this.scene.start('open-ring-mandrel'), this),

                this.add.image(scrCenter.x + 50, 60, 'btn-closed-ring')
                    .setInteractive()
                    .on('pointerdown', () => this.scene.start('closed-ring-mandrel'), this),

                this.add.image(scrCenter.x - 50, 140, 'btn-v-slot-saw')
                    .setInteractive()
                    .on('pointerdown', () => this.scene.start('v-slot-saw'), this),

                this.add.image(scrCenter.x + 50, 140, 'btn-blowtorch')
                    .setInteractive()
                    .on('pointerdown', () => this.scene.start('blowtorch'), this),

                this.add.image(scrCenter.x - 50, 220, 'btn-pliers')
                    .setInteractive()
                    .on('pointerdown', () => this.scene.start('pliers'), this),
                    
                this.add.image(scrCenter.x + 50, 220, 'btn-disc-cutter')
                    .setInteractive()
                    .on('pointerdown', () => this.scene.start('disc-cutter'), this),
            ]

            fadeOutSplash();
        },
        update: function () { }
    });

    function fadeOutSplash() {
        var fadeTarget = document.getElementById("splash");
        if (!fadeTarget)
            return;
fadeTarget.remove();
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
