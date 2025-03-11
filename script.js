var zoom = 1.5;
var config = {
    type: Phaser.AUTO,
    width: window.innerWidth / zoom,
    height: window.innerHeight / zoom,
    backgroundColor: "#ddd",
    pixelArt: true,
    zoom: zoom,
    scene:  [
        {
            key: 'main',
            preload: mainPreload,
            create: mainCreate,
            update: mainUpdate,
        },
        {
            key: 'minigame',
            preload: minigamePreload,
            create: minigameCreate,
            update: minigameUpdate,
        }
    ]
};

var SPLASH_TIMEOUT = 1000; // TODO TMP
var gameStages = {
    START: 1,
    EMAIL_ALERT: 2,
    EMAIL_ALERT_TIMER: 1 * 1000,
    EMAIL_READING: 3,
    EMAIL_READ: 4,
    MINIGAME: 5,
    ENDING: 6
};

var scrCenter = { x: config.width / 2, y: config.height / 2 };
var playerMov = { maxStep: 5 };
var playerTarget = { x: scrCenter.x, y: scrCenter.y };

var game = new Phaser.Game(config);

function mainPreload () {
    this.load.image('email-alert', 'imgs/email-alert.png');
    this.load.image('laptop', 'imgs/laptop.png');
    this.load.image('workbench', 'imgs/workbench.png');
    this.load.image('player', 'imgs/player.png');
    this.load.image('workshop-bgr', 'imgs/workshop-bgr.png');
}

function mainCreate () {
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
}

function minigamePreload() {
    this.load.image('mandrel', 'imgs/mandrel.png');
    this.load.image('mandrel-sizes-bgr', 'imgs/mandrel-sizes-bgr.png');
    this.load.image('ring-mandrel', 'imgs/ring-mandrel.png');
    this.load.image('rubber-hammer', 'imgs/rubber-hammer.png');
    
}
function minigameCreate() {
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
}

function minigameUpdate(t, framerate) {
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


function mainUpdate () {
    // this.scene.start("minigame"); // TODO TMP
                
    switch(this.gameStage) {
        case gameStages.INIT:
            this.movePlayer(this);
            
            if (this.time.now > gameStages.EMAIL_ALERT_TIMER) {
                this.emailAlert = this.add.image(scrCenter.x - 86, scrCenter.y - 80, 'email-alert');
                this.gameStage = gameStages.EMAIL_ALERT;
            }

            break;

        case gameStages.EMAIL_ALERT:
            this.movePlayer(this);
            
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
            this.movePlayer(this);
            var dist = Math.sqrt(
                Math.pow(this.workbench.x - this.player.x, 2) +
                Math.pow(this.workbench.y - this.player.y, 2)
            );
            if (dist < 20) {
                this.scene.start("minigame");
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