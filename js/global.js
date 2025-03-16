var zoom = 1.6666;
var config = {
    type: Phaser.AUTO,
    width: window.innerWidth / zoom,
    height: window.innerHeight / zoom,
    backgroundColor: "#ddd",
    pixelArt: true,
    zoom: zoom,
    scene: [],
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
