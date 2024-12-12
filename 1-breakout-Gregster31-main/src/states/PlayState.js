import Ball from "../Ball.js";
import {
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	context,
	keys,
	sounds,
	stateMachine,
	TILE_SIZE
} from "../globals.js";
import { getRandomNegativeNumber, getRandomNumber, getRandomPositiveNumber } from "../utils.js";
import State from "./State.js";

/**
 * Represents the state of the game in which we are actively playing;
 * player should control the paddle, with the ball actively bouncing between
 * the bricks, walls, and the paddle. If the ball goes below the paddle, then
 * the player should lose one point of health and be taken either to the Game
 * Over screen if at 0 health or the Serve screen otherwise.
 */
export default class PlayState extends State {
	constructor() {
		super();

		this.baseScore = 10;
		this.balls = [];
	}

	enter(parameters) {
		this.balls = [];
		this.paddle = parameters.paddle;
		this.bricks = parameters.bricks;
		this.health = parameters.health;
		this.score = parameters.score;
		this.ball = parameters.ball;
		this.userInterface = parameters.userInterface;
		this.level = parameters.level;
		this.createPowerUpBrick = Math.floor(getRandomPositiveNumber(0,this.bricks.length-1));
		this.powerUsed = false;

		this.balls.push(this.ball) // Start with current ball in the array
	}

	checkVictory() {
		/**
		 * The every method executes the provided callback function once for
		 * each element present in the array until it finds the one where callback
		 * returns a falsy value. If such an element is found, the every method
		 * immediately returns false. Otherwise, if callback returns a truthy value
		 * for all elements, every returns true.
		 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every
		 */
		return this.bricks.every(brick => !brick.inPlay);
	}

	update(dt) {
		//GAME PAUSE CODE
		if (this.paused) {
			if (keys.p) {
				keys.p = false;
				this.paused = false;
				sounds.pause.play();
			}
			else {
				return;
			}
		}
		else if (keys.p) {
			keys.p = false;
			this.paused = true;
			sounds.pause.play();
			return;
		}


		this.balls.forEach((ball, index) => {
			if (ball.didCollide(this.paddle)) {
				// Flip y velocity and reset position to on top of the paddle.
				ball.dy *= -1;
				ball.y = CANVAS_HEIGHT - TILE_SIZE * 2 - TILE_SIZE / 2;

				// Vary the angle of the ball depending on where it hit the paddle.
				ball.handlePaddleCollision(this.paddle);
				sounds.paddleHit.play();
			}

			this.bricks.forEach((brick, count) => {
				if (brick.inPlay && ball.didCollide(brick)) {
					this.score += this.baseScore * (brick.tier + 1);
					this.userInterface.update(this.health, this.score);
					// Add brick score without dying
					this.paddle.addScore(this.baseScore * (brick.tier + 1));
					
					// Call the brick's hit function, which removes it from play.
					brick.hit();
					
					if (this.checkVictory()) {
						sounds.victory.play();
						
						if (brick.powerUp) {
							brick.powerUp.killIt();
						}
						
						stateMachine.change('victory', {
							level: this.level,
							paddle: this.paddle,
							health: this.health,
							score: this.score,
							ball: new Ball(), //Only go to next level with one ball
							userInterface: this.userInterface,
						});
					}
					// 1 brick in the whole level will have a powerUp
					if(count === this.createPowerUpBrick && this.powerUsed === false) {
						// Drops a powerUp
						brick.powerUpBrick();
						this.powerUsed = true
					}
					
					ball.handleBrickCollision(brick);
				}
				// Checks if a powerUp was produced, then check if collision, then increase the number of balls if true
				if(brick.powerUp && brick.powerUp.didCollide(this.paddle)) {
					// INsures that there can be only 3 balls in play. (1 multiball per level, so it works)
					while (this.balls.length < 3) {
						this.balls.push(
							new Ball(this.ball.x, this.ball.y,),
						);
					}	
				}
			});
			
			if (ball.didFall()) {
				if(ball == this.ball){
					this.ball == this.balls[index+1]
				}
				this.balls.splice(index, 1);
			}
		});

		if(this.balls.length == 0) {
			// Reset the score, balls array and shrink the paddle
			this.balls = []
			this.paddle.resetScore()

			this.health--;
			this.userInterface.update(this.health, this.score);
			sounds.hurt.play();

			if (this.health === 0) {
				stateMachine.change('game-over', {
					score: this.score,
				});
			}
			else {
				stateMachine.change('serve', {
					paddle: this.paddle,
					ball: new Ball(),
					bricks: this.bricks,
					health: this.health,
					score: this.score,
					userInterface: this.userInterface,
					level: this.level,
				});
			}
		}

		this.paddle.update(dt);

		this.balls.forEach((ball) => {
			ball.update(dt);
		});
		
		this.bricks.forEach((brick) => {
			brick.update(dt);
		});
	}

	render() {
		this.userInterface.render();
		this.paddle.render();

		this.balls.forEach((ball) => {
			ball.render();
		});

		this.bricks.forEach((brick) => {
			brick.render();
		});

		if (this.paused) {
			context.save();
			context.font = "50px Joystix";
			context.fillStyle = "white";
			context.textBaseline = 'middle';
			context.textAlign = 'center';
			context.fillText(`⏸`, CANVAS_WIDTH * 0.5, CANVAS_HEIGHT * 0.5);
			context.restore();
		}
	}
}
