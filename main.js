// Initialize Phaser, and create a 640x480px game
var game = new Phaser.Game(600, 480, Phaser.AUTO, 'gameDiv');

WebFontConfig = {
    google: {
        families: [ 'Akronim::latin' ]
    }
};

// Create our 'main' state that will contain the game
var mainState = {

    preload: function() {
        // Load the google font specified in the WebFontConfig
        game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');

        // Load the mouse sprite
        game.load.image('mouse', 'assets/mouse.png');
        game.load.image('box', 'assets/box.png');
        game.load.image('grass', 'assets/grass.png');

        // velocity of the boxes
        this.boxVelocity = -200;
        // speed of the background grass tiles
        this.grassTileSpeed = 3.35;
        // "blocks" the space button during playing the game
        this.playing = false;
    },

    create: function() {
        // Set the physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // Display grass background on the screen
        this.grass = game.add.tileSprite(0, 0, 600, 490, 'grass');

        // Display the mouse on the screen
        this.mouse = this.game.add.sprite(100, 245, 'mouse');

        // Add the physic to the mouse
        game.physics.arcade.enable(this.mouse);

        // Call the function when the keys are hit
        var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR); // start
        spaceKey.onDown.add(this.startGame, this);

        var upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.UP); // up
        upKey.onDown.add(this.moveUp, this);
        upKey.onUp.add(this.moveReset, this);

        var downKey = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN); // down
        downKey.onDown.add(this.moveDown, this);
        downKey.onUp.add(this.moveReset, this);

        this.boxes = game.add.group(); // Create a group for the boxes
        this.boxes.enableBody = true;  // Add physics to the group
        this.boxes.createMultiple(20, 'box'); // Create 20 boxes

        //start label, explanations
        this.labelStartKey = game.add.text(this.world.centerX/3, this.world.centerY/2, "Press SPACE \nto start game", {font: "80px Akronim", fill: "#ffffff"});
    },

    update: function() {
        // If the mouse is out of the world (too high or too low), call the 'restartGame' function
        if (this.mouse.inWorld == false)
            this.restartGame();

        this.grass.tilePosition.x -= this.grassTileSpeed;

        //update game results
        game.physics.arcade.overlap(this.mouse, this.boxes, this.restartGame, null, this);
    },

    // Starts the game
    startGame: function() {
        if(!this.playing) {
            this.labelStartKey.text = "";
            this.playing = true;

            //timer for loops
            this.timer = game.time.events.loop(1500, this.addRowOfBoxes, this);

            //scoring
            this.score = 0;
            this.labelScore = game.add.text(20, 0, "0", {font: "80px Akronim", fill: "#ffffff"});
        }
    },

    // Lets the mouse move up
    moveUp: function() {
        this.mouse.body.velocity.y = -400;
    },

    // Lets the mouse move down
    moveDown: function() {
        this.mouse.body.velocity.y = 400;
    },

    // Lets the mouse move straight
    moveReset: function() {
        this.mouse.body.velocity.y = 0;
    },

    // Restart the game
    restartGame: function() {
        // Start the 'main' state, which restarts the game
        this.playing = false;
        var scoreboardEntry = prompt("Game Over! You got "+this.score+
            " points.\nEnter your username to save your result on the scoreboard.", "");
        if (scoreboardEntry != null && scoreboardEntry.length > 0) {
            console.log("works");
        }
        game.state.start('main');
    },

    addOnebox: function(x, y) {
        // Get the first dead box of our group
        var box = this.boxes.getFirstDead();

        // Set the new position of the box
        box.reset(x, y);

        // Add velocity to the box to make it move left
        box.body.velocity.x = this.boxVelocity;

        // Kill the box when it's no longer visible
        box.checkWorldBounds = true;
        box.outOfBoundsKill = true;
    },

    addRowOfBoxes: function() {
        // Pick where the hole will be
        var hole = Math.floor(Math.random() * 5) + 1;

        // Add the 6 boxes
        for (var i = 0; i < 8; i++)
            if (i != hole && i != hole + 1)
                this.addOnebox(600, i * 60);
        this.scored();
    },

    scored: function() {
        //each time we create a row of boxes the score is bigger
        this.score += 1;
        this.labelScore.text = this.score;

        if ((this.score % 10) == 0) {
            this.boxVelocity -= 50;
            this.grassTileSpeed += 0.83;
        }
    }
};

// Add and start the 'main' state to start the game
game.state.add('main', mainState);
game.state.start('main');