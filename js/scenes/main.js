(function () {
    config.scene.push({
        key: 'main',
        preload: function () {
            this.load.image('email-alert', 'imgs/email-alert.png');
            this.load.image('laptop', 'imgs/laptop.png');
            this.load.image('workbench', 'imgs/workbench.png');
            this.load.image('player', 'imgs/player.png');
            this.load.image('workshop-bgr', 'imgs/workshop-bgr.png');
        },
        create: function () {
            this.movePlayer = movePlayer;
            this.gameStage = gameStages.INIT;

            var bgr = this
                .add.image(scrCenter.x, scrCenter.y + 50, 'workshop-bgr')
                .setInteractive();

            this.laptop = this.add.image(scrCenter.x - 60, scrCenter.y - 54, 'laptop');
            this.workbench = this.add.image(scrCenter.x + 60, scrCenter.y - 60, 'workbench');

            this.player = this.add.image(scrCenter.x, scrCenter.y + 50, 'player');

            bgr.on('pointerdown', setPlayerTarget);
            setTimeout(fadeOutSplash, SPLASH_TIMEOUT);
        },
        update: function () {
            // this.scene.start("mandrel"); // TODO TMP
                        
            switch(this.gameStage) {
                case gameStages.INIT:
                    this.movePlayer();
                    
                    if (this.time.now > gameStages.EMAIL_ALERT_TIMER) {
                        this.emailAlert = this.add.image(scrCenter.x - 86, scrCenter.y - 80, 'email-alert');
                        this.gameStage = gameStages.EMAIL_ALERT;
                    }

                    break;

                case gameStages.EMAIL_ALERT:
                    this.movePlayer();
                    
                    var dist = Math.sqrt(
                        Math.pow(this.laptop.x - this.player.x, 2) +
                        Math.pow(this.laptop.y - this.player.y, 2)
                    );
                    if (dist < 20) {
                        this.gameStage = gameStages.EMAIL_READING;
                        this.emailAlert.destroy();
                        this.emailText = this.add.text(
                            scrCenter.x / 4 , scrCenter.y / 2,
                            "You have an email:\n"
                            + "Hi, I want to order a silver ring.\n" 
                            + "My budget is 15$ and my finger size is M.\n" 
                            + "Thanks!",
                            {
                                color: "#000",
                                backgroundColor: "#eeeeee",
                                padding: 10,
                                wordWrap: {
                                    width: scrCenter.x * 1.5,
                                    useAdvancedWrap: true 
                                }
                            }
                        );
                        
                        this.acceptOrder = this.add.text(
                            scrCenter.x,
                            (window.innerHeight/zoom) - 40,
                            "ACCEPT ORDER",
                            {
                                color: "#fff",
                                backgroundColor: "#00aa00",
                                padding: 10,
                            }
                        ).setInteractive();
                        
                        var dis = this;
                        this.acceptOrder.on('pointerdown', function(pointer) {
                            dis.gameStage = gameStages.EMAIL_READ;
                            dis.emailText.destroy();
                            dis.acceptOrder.destroy();
                        });
                    }

                    break;
                    
                case gameStages.EMAIL_READING:
                    break;
            
                case gameStages.EMAIL_READ:
                    this.movePlayer();
                    var dist = Math.sqrt(
                        Math.pow(this.workbench.x - this.player.x, 2) +
                        Math.pow(this.workbench.y - this.player.y, 2)
                    );
                    if (dist < 20) {
                        this.scene.start("mandrel");
                        /*
                        this.gameStage = gameStages.MINIGAME;
                        this.minigameTodo = this.add.text(
                            scrCenter.x / 4 , scrCenter.y / 2,
                            "Here there should be a minigame "
                            + "to make the silver ring.\n" 
                            + "Did you really expect it "
                            + "to be done in just 1 day? :)",
                            {
                                color: "#000",
                                backgroundColor: "#eeeeee",
                                padding: 10,
                                fixedWidth: scrCenter.x * 1.5,
                                wordWrap: {
                                    width: scrCenter.x * 1.5,
                                    useAdvancedWrap: true 
                                }
                            }
                        );
                        
                        this.endMinigame = this.add.text(
                            scrCenter.x,
                            (window.innerHeight/zoom) - 40,
                            "CONTINUE",
                            {
                                color: "#fff",
                                backgroundColor: "#00aa00",
                                padding: 10,
                            }
                        ).setInteractive();
                        
                        var dis = this;
                        this.endMinigame.on('pointerdown', function(pointer) {
                            dis.gameStage = gameStages.ENDING;
                            dis.minigameTodo.destroy();
                            
                            dis.add.text(
                                scrCenter.x / 4 , scrCenter.y / 2,
                                "You made a silver ring and got 15$!\n"
                                + "If this were a real game, "
                                + "you could reinvest your earning "
                                + "in new material and machinery...\n"
                                + "\n"
                                + "Reload to \"play\" again.",
                                {
                                    color: "#000",
                                    backgroundColor: "#eeeeee",
                                    padding: 10,
                                    wordWrap: {
                                        width: scrCenter.x * 1.5,
                                        useAdvancedWrap: true 
                                    }
                                }
                            );
                                
                            dis.endMinigame.destroy();
                            
                        });*/
                    }
                    break;

                case gameStages.ENDING:
                    break;
            }
            // cursors = this.input.keyboard.createCursorKeys();
        }
    });

    function setPlayerTarget(pointer) {
        playerTarget = {
            x: pointer.downX, 
            y: pointer.downY
        }
    }

    function movePlayer() {
        if (playerTarget.x == this.player.x && playerTarget.y == this.player.y)
            return;

        var totalX = playerTarget.x - this.player.x;
        var totalY = playerTarget.y - this.player.y;
        
        var stepX = totalX > 0 
            ? Math.min(playerMov.maxStep, totalX)
            : Math.max(-playerMov.maxStep, totalX);

        var stepY = totalY > 0 
            ? Math.min(playerMov.maxStep, totalY)
            : Math.max(-playerMov.maxStep, totalY);

        this.player.setPosition(this.player.x + stepX, this.player.y + stepY);
    }

    function fadeOutSplash() {
        var fadeTarget = document.getElementById("splash");
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