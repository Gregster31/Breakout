import { TILE_SIZE } from "./globals.js";
import Paddle from "./Paddle.js";

export default class DynamicPaddle extends Paddle{
    constructor() {
        super();
        this.scoreTracker = 0;
    }

    increasePaddleSize(){
        if(this.scoreTracker >= 200){
            this.size = 3;
        } 
        else if(this.scoreTracker >= 100){
            this.size = 2;
        } 
        else if(this.scoreTracker >= 50) {
            this.size = 1;
        } 
        else{
            this.size = 0 
        }
        this.width = TILE_SIZE * (this.size * 2 + 2);
    }

    decreasePaddleSize(){
        if(this.size > 0) {
            this.size--;
            if(this.size == 2) {
                this.scoreTracker = 100
            }
        }        
        this.width = TILE_SIZE * (this.size * 2 + 2)
    }

    addScore(score){
        // Add score
        this.scoreTracker += score;
        // Check if paddle should be increased. Makes it so you can still get the 0 paddle
        if(this.scoreTracker >= 50) {
            this.increasePaddleSize() 
        }
    }

    resetScore(){
        // Restart the count
        this.scoreTracker = 0;
        // Decrease 1 from the paddle
        this.decreasePaddleSize()
    }
}
