// Initialize Phaser, and create a 400x490px game
var game = new Phaser.Game(600, 490, Phaser.AUTO, 'gameDiv');

WebFontConfig = {
    //  The Google Fonts we want to load (specify as many as you like in the array)
    google: {
        families: [ 'Akronim::latin' ]
    }

};

// Create our 'main' state that will contain the game
var mainState = {

    preload: function() {
        game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');

        // Load the bird sprite
        game.load.image('bird', 'assets/bird.png');
        game.load.image('pipe', 'assets/pipe.png');
        game.load.image('grass', 'assets/grass.png');

        // velocity of the pipes
        this.pipeVelocity = -200;
        this.grassTileSpeed = 4;
        this.playing = false;
    },

    create: function() {
        // Set the physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // Display grass background on the screen
        this.grass = game.add.tileSprite(0, 0, 600, 490, 'grass');

        // Display the bird on the screen
        this.bird = this.game.add.sprite(100, 245, 'bird');

        // Add gravity to the bird to make it fall
        game.physics.arcade.enable(this.bird);

        // Call the 'jump' function when the spacekey is hit
        var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.startGame, this);

        var upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
        upKey.onDown.add(this.moveUp, this);
        upKey.onUp.add(this.moveReset, this);

        var downKey = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        downKey.onDown.add(this.moveDown, this);
        downKey.onUp.add(this.moveReset, this);

        this.pipes = game.add.group(); // Create a group
        this.pipes.enableBody = true;  // Add physics to the group
        this.pipes.createMultiple(20, 'pipe'); // Create 20 pipes


        //start label, explanations
        this.labelStartKey = game.add.text(this.world.centerX/3, this.world.centerY/2, "Press SPACE \nto start game", {font: "80px Akronim", fill: "#ffffff"});
    },

    update: function() {
        // If the bird is out of the world (too high or too low), call the 'restartGame' function
        if (this.bird.inWorld == false)
            this.restartGame();

        this.grass.tilePosition.x -= this.grassTileSpeed;

        //update game results
        game.physics.arcade.overlap(this.bird, this.pipes, this.restartGame, null, this);
    },

    // Starts the game
    startGame: function() {
        if(!this.playing) {
            this.labelStartKey.text = "";
            if(this.gameOverLabel != null)
                this.gameOverLabel.text = "";
            this.playing = true;
            //timer for loops
            this.timer = game.time.events.loop(1500, this.addRowOfPipes, this);

            //scoring
            this.score = 0;
            this.labelScore = game.add.text(20, 20, "0", {font: "60px Akronim", fill: "#ffffff"});
        }
    },

    // Lets the mouse move up
    moveUp: function() {
        this.bird.body.velocity.y = -400;
    },

    // Lets the mouse move down
    moveDown: function() {
        this.bird.body.velocity.y = 400;
    },

    // Lets the mouse move straight
    moveReset: function() {
        this.bird.body.velocity.y = 0;
    },

// Restart the game
    restartGame: function() {
        // Start the 'main' state, which restarts the game
        this.playing = false;
        this.labelScore.text = "";
        this.gameOverLabel = game.add.text(this.world.centerX/3, this.world.centerY/2, "", {font: "80px Akronim", fill: "#ffffff"});
        this.gameOverLabel.text = "Game Over!\nFinal Score: "+this.score
        setTimeout(function(){
            game.state.start('main');
        }, 2000);
    },

    addOnePipe: function(x, y) {
        // Get the first dead pipe of our group
        var pipe = this.pipes.getFirstDead();

        // Set the new position of the pipe
        pipe.reset(x, y);

        // Add velocity to the pipe to make it move left
        pipe.body.velocity.x = this.pipeVelocity;

        // Kill the pipe when it's no longer visible
        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
    },

    addRowOfPipes: function() {
        // Pick where the hole will be
        var hole = Math.floor(Math.random() * 5) + 1;

        // Add the 6 pipes
        for (var i = 0; i < 9; i++)
            if (i != hole && i != hole + 1)
                this.addOnePipe(600, i * 60);
        this.scored();
    },

    scored: function() {
        //each time we create a row of pipes the score is bigger
        this.score += 1;
        this.labelScore.text = this.score;

        if ((this.score % 10) == 0) {
            this.pipeVelocity -= 50;
            this.grassTileSpeed += 1;
        }
    }
};

// Add and start the 'main' state to start the game
game.state.add('main', mainState);
game.state.start('main');