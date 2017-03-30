class Vec
{
	 constructor(x=0,y=0)
	 {
		this.x=x;
		this.y=y; 	

	 }
	 get len()
	 {
	 	return Math.sqrt(this.x*this.x+this.y*this.y);
	 }
	 set len(value)
	 {
	 	const fact=value/this.len;
	 	this.x*=fact;
	 	this.y*=fact;
	 }

}
class Rect 
{
	constructor(w,h)
	{
		this.pos=new Vec;
		this.size=new Vec(w,h);

	}
	get left()
	{
		return this.pos.x - this. size.x/2;
	}
	get right()
	{
		return this.pos.x + this. size.x/2;
	}
	get top()
	{
		return this.pos.y - this. size.y/2;
	}
	get bottom()
	{
		return this.pos.y + this. size.y/2;
	}
}
class Ball extends Rect 
{
	constructor()
	{
		super(10,10);
		this.vel=new Vec;
	}
}
class Player extends Rect
{
	constructor()
	{
		super(15,50);
		this.vel = new Vec;
		this.speed=100;
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
		//console.log("newHighScore");
		this.highscore=score;
		this.cookie.setCookie("HighScore", this.highscore, 365);
	}
	loadHighScore()
	{
		//console.log("loadHighScore");
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
	move(position)
	{
		this.pos.y=position;
	}

}