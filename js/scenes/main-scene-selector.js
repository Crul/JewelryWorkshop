(function () {
    config.scene.push({
        key: 'main',
        preload: function () { },
        create: function () {
            var menuTxts = config.scene.map((scene, idx) => {
                return this.add.text(20, 50 + idx * 30, scene.description, { color: '#000' })
                    .setInteractive()
                    .on('pointerdown', () => {
                        this.scene.start(scene.key);
                        for (var i = menuTxts.length - 1; i >= 0 ; i--)
                            menuTxts[i].destroy();
                    }, this);
            });
            if (document.getElementById("splash"))
                document.getElementById("splash").remove();
        },
        update: function () { }
    });
})();
