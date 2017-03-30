class Player extends Rect
{
	constructor()
	{
		super(15,50);
		this.vel = new Vec;
		this.score=0;
		this.points=0;
		this._lastPos=new Vec;
		this.highscore=0;
		this.cookie=new Cookie();
		this.loadHighScore();
		
	}
	update(dt)
    {
        this.vel.y = (this.pos.y - this._lastPos.y) / dt;
        this._lastPos.y = this.pos.y;
    }
    reset(y)
    {
    	this.pos.y=y;
    	this.vel.x=0;
    	this.vel.y=0;
    }
    getHighScore()
    {
    	return this.highscore;
    }
    newHighScore(score)
	{
		console.log("newHighScore");
		this.highscore=score;
		this.cookie.setCookie("HighScore", this.highscore, 365);
	}
	loadHighScore()
	{
		console.log("loadHighScore");
		var score = this.cookie.getCookie("HighScore");
	    if (score != "") {
	        this.highscore=score;
	    } else {
	        this.highscore=0;
	    }
	}
	
	addPoints(point)
	{
		this.points+=point;
		if(this.points>this.highscore)
		{
			this.newHighScore(this.points);
		}
	}
	hit(mult)
	{
		this.addPoints(10*mult);
	}
	goal(mult)
	{
		this.addPoints(100*mult);
	}
	win(mult)
	{
		this.addPoints(1000*mult);
	}

}