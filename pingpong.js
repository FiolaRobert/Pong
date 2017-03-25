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
		this.score=0;
		this._lastPos=new Vec;

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
}
class Pong{
	constructor(canvas)
	{
		this._canvas=canvas;
		this._context=canvas.getContext('2d');
		this.initialSpeed=250;
		this.velX=0;
		this.velY=0;
		this.aiSpeed=1;
		this.activeAI=true;
		this.difficulty=0;

		this._accumulator=0;
		this.step=1/120;

		this.ball=new Ball;
		

		this.players=[
		new Player,
		new Player,
		];
		
		

		let lastTime;
		
		this.callback =(millis)=> {
			if(lastTime)
			{
				this.update((millis-lastTime)/1000);
				this.draw();
			}
			lastTime=millis;
			requestAnimationFrame(this.callback);
		};

		this.CHAR_PIXEL=10;
		this.CHARS=[
		'111101101101111',
		'010010010010010',
		'111001111100111',
		'111001111001111',
		'101101111001001',
		'111100111001111',
		'111100111101111',
		'111101001001001',
		'111101111101111',
		'111101111001111',
		].map(str => {
			const canvas = document.createElement('canvas');
			canvas.height = this.CHAR_PIXEL * 5;
			canvas.width = this.CHAR_PIXEL * 3;
			const context=canvas.getContext('2d');
			context.fillStyle='#fff';
			str.split('').forEach((fill, i) => {
				if(fill==='1'){
					context.fillRect((i%3)*this.CHAR_PIXEL, (i/3|0)*this.CHAR_PIXEL,
						this.CHAR_PIXEL,
						this.CHAR_PIXEL);
				}
			});
			return canvas;
		});
		this.reset();
	}
	

	

	collide(player, ball)
	{

		if(player.left<ball.right && player.right>ball.left && 
			player.top<ball.bottom && player.bottom>ball.top)
		{
			if(player.top<ball.bottom && player.bottom>ball.top)
			{//has glitch of shooting vertically and getting stuck
				ball.pos.x-=ball.vel.x*this.step;
				this.velX = -ball.vel.x*1.05 + player.vel.y*0.2;
				ball.vel.x=this.velX;
				//var len=ball.vel.len;
				this.velY+=player.vel.y*0.2;
				ball.vel.y+=this.velY;
				//ball.vel.len=len;
				if(ball.vel.x>0 && ball.vel.x<this.initialSpeed)
				{
					this.velX=this.initialSpeed;
					ball.vel.x=this.velX;
				}
				else if(ball.vel.x<0 && ball.vel.x<-this.initialSpeed)
				{
					this.velX=-this.initialSpeed;
					ball.vel.x=-this.velX;
				}
			}
			else 
			{
				this.velX =ball.vel.x*1.05;
				ball.vel.x=this.velX;
				//var len=ball.vel.len;
				this.velY+=player.vel.y;
				ball.vel.y+=this.velY;
				//ball.vel.len=len;
				
			}
			this.sound("hit");
		}
	}

	draw()
	{
		this._context.fillStyle='#055';
		this._context.fillRect(0,0, 
			this._canvas.width, this._canvas.height);
		this.drawRect(this.ball);
		this.players.forEach(player=>{
			this.drawRect(player);
		});
		this.drawScore();
	}
	drawRect(rect)
	{
		this._context.fillStyle='#fff';
		this._context.fillRect(rect.left, rect.top, 
								rect.size.x, rect.size.y);
	}
	drawScore()
	{
		const align = this._canvas.width/3;
		const CHAR_W=this.CHAR_PIXEL*4;
		this.players.forEach((player, index)=>{
			const chars=player.score.toString().split('');
			const offset = align*
							(index+1) - 
							(CHAR_W*chars.length/2)+this.CHAR_PIXEL/2;
			chars.forEach((char,pos)=>{
				this._context.drawImage(this.CHARS[char|0],
											offset+pos*CHAR_W, 20);
			});
		});
	}
	//make follow ball at set speed
	moveAI()
	{
		const ball=this.ball.pos;
		const player=this.players[1].pos;
		
		if(this.ball.vel.x>0)//moving toward player[1]
		{
			//console.log(this.players[1].pos.y);
			if(ball.y>player.y)
			{
				if(ball.y-player.y<=this.aiSpeed) 
				{
					player.y=ball.y;
				}
				else{
					player.y+=this.aiSpeed;
				}
			}
			else if (ball.y<player.y)
			{
				if(player.y-ball.y<=this.aiSpeed) 
				{
					player.y=ball.y;
				}
				else
				{
					player.y-=this.aiSpeed;
				}
			}
		}
		

	}

	play()
	{
		const b=this.ball;
		if(b.vel.x===0 && b.vel.y===0)//if not moving
		{
			if(b.pos.x===this._canvas.width/2 && b.pos.y===this._canvas.height/2)//if in center
			{
				//move with new values
				this.velX=200*(Math.random()>.5? 1:-1);
				this.velY=200*(Math.random() *2-1);
				b.vel.x=this.velX;
				b.vel.y=this.velY;
				b.vel.len=this.initialSpeed;

			}
			else
			{
				//move using current values
				this.ball.vel.x=this.velX;
				this.ball.vel.y=this.velY;
				this.ball.vel.len=this.initialSpeed;
			}
		}
		else//is moving, pause
		{
			b.vel.x=0;
			b.vel.y=0;
		}
	}

	reset()
	{
		this.ball.pos.x=this._canvas.width/2;
		this.ball.pos.y=this._canvas.height/2;
		this.ball.vel.x=0;
		this.ball.vel.y=0;
		this.players[0].pos.x=40;
		this.players[1].pos.x=this._canvas.width-40;
		this.players.forEach(player=>
		{
			player.reset(this._canvas.height/2) ;
		});
	}

	setDifficulty(difficulties)
	{
		var difficulty=0;
		for (var i = difficulties.length - 1; i >= 0; i--) 
		{
			if(difficulties[i].checked)
			{
				difficulty=i;
				break;
			}
		}
		switch(difficulty)
		{
			case 0: this.aiSpeed=1;break;
			case 1: this.aiSpeed=2;break;
			case 2: this.aiSpeed=3;break;
			case 3: this.aiSpeed=4;break;
			default: this.aiSpeed=10;break;

		}
		
	}

	sound(event)
	{
		var index=-1;
		const options=["win", "lose", "hit", "wall", "miss", "score"];
		for (var i = 0; i < options.length; i++) 
		{
			if(options[i]==event)
			{
				index=i;
			}
		}
		if(index!==-1)
		{
			var audio=new Audio(document.getElementById(options[index]).src);
		}
		audio.play();
	}

	start()
	{
		
		requestAnimationFrame(this.callback);
	}

	simulate(dt)
	{
		const vel=this.ball.vel;
		this.ball.pos.x+=vel.x*dt;
		this.ball.pos.y+=vel.y*dt;

		if(this.activeAI=true)
		{
			this.moveAI();
		}
		if(this.ball.left<0 || this.ball.right>this._canvas.width)
		{
			if(this.ball.left<0){
				this.sound("miss");
			}
			else if(this.ball.right>this._canvas.width)
			{
				this.sound("score");
			}

			const playerId=vel.x<0|0;
			const player =this.players[playerId];
			player.score++;
			this.reset();
			if(player.score>=10)
			{

				if(playerId===0)
				{
					this.sound("win");
					window.setTimeout(function(){alert('Player One Wins')},1500);

				}
				else if(playerId===1)
				{
					this.sound("lose");
					window.setTimeout(function(){alert('Player Two Wins')},1000);
				}
				this.players.forEach(player =>{
					player.score=0;
				});
			}
			
		}

		if(this.ball.top<0)
		{
			this.ball.pos.y=this.ball.bottom;
				vel.y=-vel.y+1;
			this.sound("wall");
			
		}
		else if(this.ball.bottom>this._canvas.height)
		{
			this.ball.pos.y=this.ball.top;
			vel.y=-vel.y+1;
			this.sound("wall");
		}
		
		this.players.forEach(player =>{
			player.update(dt);
			this.collide(player, this.ball);
		});
		
	}

	update(dt)
	{
		this._accumulator+= dt;
		while (this._accumulator>this.step)
		{
			this.simulate(this.step);
			this._accumulator-=this.step;
		}
	}
	
}
const canvas=document.getElementById('pong');
canvas.style.position="center";
const pong=new Pong(canvas);
const difficulties=document.getElementsByClassName('difficulty');
canvas.addEventListener('mousemove',event =>
{
	const scale=event.offsetY/event.target.getBoundingClientRect().height;
	pong.players[0].pos.y=canvas.height*scale;
});
canvas.addEventListener('click',event =>
{
	this.difficulties=document.getElementsByClassName('difficulty');
	pong.setDifficulty(difficulties);
	pong.play();

});
document.onkeydown = checkKey;

function checkKey(e) {

    e = e || window.event;

    if (e.keyCode == '27') {
        pong.reset();
    }

}
pong.start();

