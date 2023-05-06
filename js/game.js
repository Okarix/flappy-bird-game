// select cvs
const canvas = document.querySelector("#canvas");
const context = canvas.getContext("2d");

// game vars and consts
let frames = 0;
const DEGREE = Math.PI / 180;

// load sprite img
const sprite = new Image();
sprite.src = "../assets/img/sprite.png";

// load sounds 
const SCORE = new Audio();
SCORE.src = "../assets/audio/point.ogg";

const WING = new Audio();
WING.src = "../assets/audio/wing.ogg";

const HIT = new Audio();
HIT.src = "../assets/audio/hit.ogg";

const SWOOSH = new Audio();
SWOOSH.src = "../assets/audio/swoosh.ogg";

const DIE = new Audio();
DIE.src = "../assets/audio/die.ogg";


// game state
const state = {
    current: 0,
    getReady: 0,
    game: 1,
    over: 2,
}

// start button coord
const startBtn = {
    x: 120,
    y: 263,
    w: 83,
    h: 29,
}

const birdBtn = {
    x: 137,
    y: 248,
    w: 45,
    h: 27,
}

const tapBtn = {
    x: 105,
    y: 317,
    w: 116,
    h: 34,
}

// control the game
canvas.addEventListener("click", function (e) {

    let rect = canvas.getBoundingClientRect();
    let clickX = e.clientX - rect.left;
    let clickY = e.clientY - rect.top;

    switch (state.current) {
        case state.getReady:
            if (clickX >= tapBtn.x && clickX <= tapBtn.x + tapBtn.w && clickY >= tapBtn.y && clickY <= tapBtn.y + tapBtn.h) {
                state.current = state.game;
                SWOOSH.play();
            }

            if (clickX >= birdBtn.x && clickX <= birdBtn.x + birdBtn.w && clickY >= birdBtn.y && clickY <= birdBtn.y + birdBtn.h) {
                currentBirdIndex = (currentBirdIndex + 1) % birds.length;
            }
            break;
        case state.over:

            // check if we click on the start button
            if (clickX >= startBtn.x && clickX <= startBtn.x + startBtn.w && clickY >= startBtn.y && clickY <= startBtn.y + startBtn.h) {
                pipes.reset();
                bird.speedReset();
                score.reset();
                state.current = state.getReady;
            }
            break;
    }
});

document.addEventListener("keydown", event => {
    if (state.current == state.game) {
        if (event.code === "Space") {
            bird.flap();
            WING.play();
        }
    }
});

// background
const backgrounds = [{ sX: 0, sY: 0, w: 288, h: 512, x: 0, y: canvas.height - 512, },
{ sX: 680, sY: 0, w: 288, h: 512, x: 0, y: canvas.height - 512, }];

let currentBackgroundIndex = 0;
const bg = {
    ...backgrounds[currentBackgroundIndex],

    draw: function () {
        context.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);

        context.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    }

}

// foreground 
const fg = {
    sX: 288,
    sY: 0,
    w: 288,
    h: 112,
    x: 0,
    y: canvas.height - 112,

    dx: 2,

    draw: function () {
        context.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);

        context.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    },

    update: function () {
        if (state.current == state.game) {
            this.x = (this.x - this.dx) % (this.w / 2);
        }
    }
}

// bird
const birds = [
    {
        animation: [
            { sX: 288, sY: 112 },
            { sX: 288, sY: 136 },
            { sX: 288, sY: 160 },
            { sX: 288, sY: 136 },
        ],
    },
    {
        animation: [
            { sX: 322, sY: 112 },
            { sX: 322, sY: 136 },
            { sX: 322, sY: 160 },
            { sX: 322, sY: 136 },
        ],
    },
    {
        animation: [
            { sX: 356, sY: 112 },
            { sX: 356, sY: 136 },
            { sX: 356, sY: 160 },
            { sX: 356, sY: 136 },
        ],
    }
];

let currentBirdIndex = 0;

const bird = {
    ...birds[currentBirdIndex],
    x: 50,
    y: 150,
    w: 34,
    h: 24,

    radius: 12,

    frame: 0,

    gravity: 0.25,
    jump: 4.6,
    speed: 0,
    rotation: 0,


    draw: function () {
        // let bird = this.animation[this.frame];
        let bird = birds[currentBirdIndex].animation[this.frame];

        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.rotation);
        context.drawImage(sprite, bird.sX, bird.sY, this.w, this.h, - this.w / 2, - this.h / 2, this.w, this.h);
        context.restore();
    },

    flap: function () {
        this.speed = - this.jump;
    },

    update: function () {
        // if the game state is get ready state, the bird must flap slowly
        this.period = state.current == state.getReady ? 10 : 5;
        // we inc the frame by 1, each period
        this.frame += frames % this.period == 0 ? 1 : 0;
        // frame goes from 0 to 4, then again to 0
        this.frame = this.frame % this.animation.length;

        if (state.current == state.getReady) {
            this.y = 150; // reset position of the bird after game over
            this.rotation = 0 * DEGREE;
        } else {
            this.speed += this.gravity;
            this.y += this.speed;

            if (this.y + this.h / 2 >= canvas.height - fg.h) {
                this.y = canvas.height - fg.h - this.h / 2;
                if (state.current == state.game) {
                    state.current = state.over;
                    DIE.play();
                }
            }

            // if the speed is greater than the jump means the bird is falling down
            if (this.speed >= this.jump) {
                this.rotation = 90 * DEGREE;
                this.frame = 1;
            } else {
                this.rotation = -25 * DEGREE;
            }
        }
    },

    speedReset: function () {
        this.speed = 0;
    }
}

// get ready message
const getReady = {
    sX: 288,
    sY: 184,
    w: 184,
    h: 267,
    x: canvas.width / 2 - 184 / 2,
    y: 80,

    draw: function () {
        if (state.current == state.getReady) {
            context.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }
}

// game over message
const gameOver = {
    sX: 302,
    sY: 451,
    w: 226,
    h: 208,
    x: canvas.width / 2 - 226 / 2,
    y: 90,

    draw: function () {
        if (state.current == state.over) {
            context.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }
}

// pipes 
const pipeColors = [
    { top: { sX: 524, sY: 112 }, bottom: { sX: 472, sY: 112 } },
    { top: { sX: 628, sY: 112 }, bottom: { sX: 576, sY: 112 } }
];
let currentPipeColorIndex = 0;

const pipes = {
    position: [],

    top: {
        sX: pipeColors[currentPipeColorIndex].top.sX,
        sY: pipeColors[currentPipeColorIndex].top.sY,
    },
    bottom: {
        sX: pipeColors[currentPipeColorIndex].bottom.sX,
        sY: pipeColors[currentPipeColorIndex].bottom.sY,
    },

    w: 52,
    h: 320,
    gap: 85,
    maxYPos: -150,
    dx: 2,

    draw: function () {
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];

            let topYPos = p.y;
            let bottomYPos = p.y + this.h + this.gap;

            //top pipe
            context.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, p.x, topYPos, this.w, this.h);

            // bottom pipe
            context.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottomYPos, this.w, this.h);
        }
    },

    update: function () {
        if (state.current !== state.game) return;

        if (frames % 100 == 0) {
            this.position.push({
                x: canvas.width,
                y: this.maxYPos * (Math.random() + 1)
            });
        }
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];

            let bottomPipeYPos = p.y + this.h + this.gap;

            // collision detection
            // top pipe 
            if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > p.y && bird.y - bird.radius < p.y + this.h) {
                state.current = state.over;
                HIT.play();
            }

            // bottom pipe 
            if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > bottomPipeYPos && bird.y - bird.radius < bottomPipeYPos + this.h) {
                state.current = state.over;
                HIT.play();
            }

            // move the pipes to the left 
            p.x -= this.dx;

            // if the pipes go beyond canvas, we delete them from the array
            if (p.x + this.w <= 0) {
                this.position.shift();
                score.value += 1;
                SCORE.play();
                score.best = Math.max(score.value, score.best);
                localStorage.setItem("best", score.best);

                if (score.value % 5 === 0) {
                    currentBackgroundIndex = (currentBackgroundIndex + 1) % backgrounds.length;
                    currentPipeColorIndex = (currentPipeColorIndex + 1) % pipeColors.length;

                    bg.sX = backgrounds[currentBackgroundIndex].sX;
                    bg.sY = backgrounds[currentBackgroundIndex].sY;
                    bg.w = backgrounds[currentBackgroundIndex].w;
                    bg.h = backgrounds[currentBackgroundIndex].h;
                    bg.x = backgrounds[currentBackgroundIndex].x;
                    bg.y = backgrounds[currentBackgroundIndex].y;

                    pipes.top.sX = pipeColors[currentPipeColorIndex].top.sX;
                    pipes.top.sY = pipeColors[currentPipeColorIndex].top.sY;
                    pipes.bottom.sX = pipeColors[currentPipeColorIndex].bottom.sX;
                    pipes.bottom.sY = pipeColors[currentPipeColorIndex].bottom.sY;
                }
            }
        }
    },

    reset: function () {
        this.position = [];
    }
}

// score 
const score = {
    best: parseInt(localStorage.getItem("best")) || 0,
    value: 0,

    draw: function () {
        context.fillStyle = "#FFF";
        context.strokeStyle = "#000";

        if (state.current == state.game) {
            context.lineWidth = 2;
            context.font = "35px Teko";
            context.fillText(this.value, canvas.width / 2, 50);
            context.strokeText(this.value, canvas.width / 2, 50);

        } else if (state.current == state.over) {
            // score value
            context.font = "25px Teko";
            context.fillText(this.value, 225, 188);
            context.strokeText(this.value, 225, 188);

            //best score
            context.fillText(this.best, 225, 230);
            context.strokeText(this.best, 225, 230);
        }
    },

    reset: function () {
        this.value = 0;
    }
}

// draw
function draw() {
    context.fillRect(0, 0, canvas.width, canvas.height);
    bg.draw();
    pipes.draw();
    fg.draw();
    bird.draw();
    getReady.draw();
    gameOver.draw();
    score.draw();
}

// update
function update() {
    bird.update();
    fg.update();
    pipes.update();
}

// loop
function loop() {
    update();
    draw();
    frames++;
    requestAnimationFrame(loop);
}
loop();