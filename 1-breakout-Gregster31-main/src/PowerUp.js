import {
	CANVAS_HEIGHT,
} from "./globals.js";
import SpriteManager from "./SpriteManager.js";
import { getRandomNumber, getRandomNegativeNumber } from "./utils.js";
import Vector from "./Vector.js";

/*
Only a single powerUp can be created per level. 
If the user misses the power-up, no other will spawn for the level.
*/
export default class PowerUp {
    constructor(x, y) {
        // position of the powerUp(Where the brick was hit)
		this.position = new Vector(x, y);
        //Controls the speed at which the powerUp goes down
        this.velocity = new Vector(0, getRandomNegativeNumber(60, 120));
        // Manages the time that the powerup is alive
		this.isAlive = true;

        this.sprites = SpriteManager.generatePowerUpSprites();
    }

    didCollide(target) {
        // Checks if powerUp collided with paddle.
		if (this.position.x + this.sprites[8].width >= target.x
			&& this.position.x <= target.x + target.width
			&& this.position.y + this.sprites[8].height >= target.y
			&& this.position.y <= target.y + target.height) {
                this.killIt()
                return true
            }
        return false
	}

    killIt() {
        this.isAlive = false;
    }

    update(dt) {
        // The powerUp needs to go down
        this.position.y += this.velocity.y * -dt;

        // Delete powerUp if lower than paddle
        if (this.position.y > CANVAS_HEIGHT - 10) {
            this.killIt()
        }
    }

	render() {
        if(this.isAlive){
            // Renders the 8th powerUp == MultiBall
            this.sprites[8].render(this.position.x, this.position.y);
        }
	}
}