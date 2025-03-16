(function () {
    config.scene.push({
        key: 'mandrel',
        preload: function() {
            this.load.image('mandrel', 'imgs/mandrel.png');
            this.load.image('mandrel-sizes-bgr', 'imgs/mandrel-sizes-bgr.png');
            this.load.image('ring-mandrel', 'imgs/ring-mandrel.png');
            this.load.image('rubber-hammer', 'imgs/rubber-hammer.png');
        },
        create: function () {
            this.add.tileSprite(scrCenter.x, scrCenter.y, config.width, config.height, "mandrel-sizes-bgr");
            
            var txtConfig = { color: '#000', fontSize: 30 };
            this.add.text(scrCenter.x - 80, scrCenter.y - 145, "XS", txtConfig);
            this.add.text(scrCenter.x - 80, scrCenter.y - 95, "S", txtConfig);
            this.add.text(scrCenter.x - 80, scrCenter.y - 45, "M", txtConfig);
            this.add.text(scrCenter.x - 80, scrCenter.y + 5, "L", txtConfig);
            this.add.text(scrCenter.x - 80, scrCenter.y + 55, "XL", txtConfig);
                        
            this.add.image(scrCenter.x, scrCenter.y, 'mandrel');
            this.ring = this.add.image(scrCenter.x, scrCenter.y - 135, 'ring-mandrel');
            this.ring.setScale(0.4);
            
            this.hammer = this.add.image(scrCenter.x + 310, scrCenter.y - 30, 'rubber-hammer');
            this.hammer.setOrigin(1, 1);
            this.hammer.setScale(1.2);
            
            this.buttonPressing = false;
            this.hasButtonBeenReleased = true;
            this.hammering = false;
            this.hammerForce = 0;
            this.maxHammerForce = 35;
            this.input.on('pointerdown', () => this.buttonPressing = true);
            this.input.on('pointerup', () => this.buttonPressing = false);
        },
        update: function (t, framerate) {
            if (this.hammering) {
                this.hammer.rotation -= 0.5;
                if (this.hammer.rotation <= 0) {
                    this.ring.y += 2 * this.hammerForce;
                    this.hammer.y += 2 * this.hammerForce;
                    
                    var ringDownPerc =
                        (this.ring.y - (scrCenter.y - 135))
                        / (313.33333333333337 - (scrCenter.y - 135));
                    console.log(ringDownPerc);

                    this.ring.setScale(0.4 + ringDownPerc * 0.3);
                    
                    this.hammer.rotation = 0;
                    this.hammerForce = 0;
                    this.hammering = false;
                    this.hasButtonBeenReleased = false;
                }
                return;
            }
            
            if (this.buttonPressing) {
                if (!this.hasButtonBeenReleased)
                    return;

                this.hammer.rotation += 0.03;
                this.hammerForce += 1;
                if (this.hammerForce > this.maxHammerForce) {
                    this.hammering = true;
                }
            } else {
                this.hasButtonBeenReleased = true;
                if (this.hammerForce > 0)
                    this.hammering = true;
            }
        }
    });
})();
