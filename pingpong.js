class Pong{
	constructor(canvas)
	{
		//this.pongManager=new PongManager(document);
		//this.connectionManager=new ConnectionManager(pongManager);
		//this.connectionManager.connect('ws://localhost:9000');

		this._canvas=canvas;
		this._context=canvas.getContext('2d');
		
		this.initialSpeed=250;
		this.velX=0;
		this.velY=0;
		this.aiSpeed=1;
		this.activeAI=true;
		this.vs;
		this.isPaused=true;
		this.p1move=0;
		this.p2move=0;

		this._accumulator=0;
		this.step=1/120;

		//this.ball=this.pongManager.ball;
		this.ball=new Ball();
		//this.players=this.pongManager.players;
		this.players=[
		new Player(false),
		new Player(true)];
		
		this.drawPoints();
		this.setDifficulty();
		let lastTime;
		
		this.callback =(millis)=> {
			if(lastTime)
			{
				this.update((millis-lastTime)/1000);
				this.drawPoints();
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
					
					context.beginPath();
					context.arc(this.CHAR_PIXEL/2+(i%3)*this.CHAR_PIXEL, this.CHAR_PIXEL/2+(i/3|0)*this.CHAR_PIXEL,this.CHAR_PIXEL/3,0,2*Math.PI);
					context.fillStyle="#fff";
					context.fill();
					
				}
			});
			return canvas;
		});
		this.reset();
	
	}

	keyPress(event)
	{
		if(event.keyCode=='87')//W key
		{
			this.p1move=-5;
			
			

		}
		else if(event.keyCode=='83')//S key
		{
			this.p1move=5;
			
		}

		if(!this.activeAI)//2 player mode
		{
			if(event.keyCode=='38')//up key
			{
				this.p2move=-5;
			
			}else if(event.keyCode=='40')//down key
			{
				this.p2move=5;
				
			}
		}

		
		
	}
	keyRelease(event)
	{
		if(event.keyCode=='87')//W key
		{
			this.p1move=0;
			

		}
		else if(event.keyCode=='83')//S key
		{
			this.p1move=0;
			
		}

		if(!this.activeAI)//2 player mode
		{
			if(event.keyCode=='38')//up key
			{
				this.p2move=0;
			
			}else if(event.keyCode=='40')//down key
			{
				this.p2move=0;
				
			}
		}
	}

	
//bounce when ball hits players
	collide(player, ball)
	{

		if(player.left<ball.right && 
			player.right>ball.left && 
			player.top<ball.bottom && 
			player.bottom>ball.top)
		{
			//console.log(player.vel.y+", "+ this.velX+", "+ this.velY)
			player.hit(this.aiSpeed);
			//has glitch of shooting vertically and getting stuck
			var angle=ball.pos.y-player.pos.y;
			//X
			ball.pos.x-=ball.vel.x*this.step;
			this.velX = -ball.vel.x *1.05;//progressively faster
			ball.vel.x=this.velX;
			//Y
			//console.log("before:"+this.velY);
			if(angle!=0)
			{
				//console.log(player.vel.y/2);
				this.velY=angle*3 + player.vel.y/2;
			}
			//console.log("angle:"+angle);
			//console.log("after:"+this.velY);

			ball.vel.y=this.velY;

			//minimum ball speed
			if(ball.vel.x>0 && ball.vel.x<this.initialSpeed)
			{
				this.velX=this.initialSpeed;
				ball.vel.x=this.velX;
			}
			else if(ball.vel.x<0 && ball.vel.x>-this.initialSpeed)
			{
				this.velX=-this.initialSpeed;
				ball.vel.x=this.velX;
			}
			
			this.sound("hit");
		}
	}
//draw objects on convas
	draw()
	{
		this._context.fillStyle='#055';
		this._context.fillRect(0,0, 
			this._canvas.width, this._canvas.height);
		this.drawCirc(this.ball);
		this.players.forEach(player=>{
			this.drawPaddle(player);
		});
		this.drawScore();
		if(this.isPaused)
		{
			this.drawPaused();
		}
	}
	drawPaused(){
		var width=100;
		var height=20;
		this._context.fillStyle="#000";
		this._context.fillRect(this._canvas.width/2-width/2, this._canvas.height/2-height/2, width,height)
		this._context.fillStyle="#fff";
		this._context.fillText("PAUSED",this._canvas.width/2, this._canvas.height/2);
		 this._context.textAlign = "center";
	}
	drawRect(rect)
	{
		
		this._context.fillRect(rect.left, rect.top, 
								rect.size.x, rect.size.y);
	}
	drawPaddle(player)
	{
		this.drawRect(player);
	}
	drawCirc(circ)
	{
		var ctx=this._context;
		
		ctx.beginPath();
		ctx.arc(circ.pos.x,circ.pos.y,circ.size.x/2,0,2*Math.PI);
		this._context.fillStyle="#fff";
		ctx.fill();
	}
	drawPoints()
	{
		var points=document.getElementById('Points-'+0);
		points.innerHTML = this.players[0].points;

		var highscore=document.getElementById('HighScore-'+0);
		highscore.innerHTML = this.players[0].highscore;

		points=document.getElementById('Points-'+1);
		points.innerHTML = this.players[1].points;

		highscore=document.getElementById('HighScore-'+1);
		highscore.innerHTML = this.players[1].highscore;
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

	//make player 2 follow ball at set speed
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
		this.checkPlayer(this.players[1]);
		
		

	}
	checkPlayer(player){
		if(player.top<0)
		{
			player.pos.y=player.size.y/2;
		}
		else if(player.bottom>this._canvas.height)
		{
			player.pos.y=this._canvas.height-player.size.y/2;
		}
	}
	//
	movePlayer(player, dir)
	{
		var position=player.pos.y+dir;
		player.move(position);
		this.checkPlayer(player);
		this.draw();
	}
//define values of ball movement
	play()
	{
		
		const b=this.ball;
		if(this.isPaused)//if not moving
		{
			if(b.pos.x===this._canvas.width/2 && b.pos.y===this._canvas.height/2)//if in center
			{
				//move with new values
				this.velX=this.initialSpeed*(Math.random()>.5? 1:-1);
				this.velY=this.initialSpeed*(Math.random() *2-1);
				b.vel.x=this.velX;
				b.vel.y=this.velY;
				b.vel.len=this.initialSpeed;

			}
		}
		this.pause();//change pause value


	}
	pause()
	{

		this.isPaused=!this.isPaused;
	}
//clear all values
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
		this.isPaused=true;
	}
//choose difficulty
	setDifficulty()
	{
		const url=parent.document.URL;
		const keys=url.substring(url.indexOf('?')+1, url.length).split('=');
		if(keys[0]=='difficulty'){
			var difficulty=keys[1];
			console.log('difficulty:'+difficulty);
			
			switch(parseInt(difficulty))
			{
				case 0: this.aiSpeed=1;break;
				case 1: this.aiSpeed=2;break;
				case 2: this.aiSpeed=3;break;
				case 3: this.aiSpeed=10;break;
				default: this.aiSpeed=1;break;

			}
		}
		
	}
	//choose num of players
	setPlayers(players)
	{
		var player=0;
		const url=parent.document.URL;
		const keys=url.substring(url.indexOf('?')+1, url.length).split('=');

		if(keys[0]=='host'){//2player
			player=keys[1];
			console.log('host:'+player);
			this.activeAI=false;

			//disable until someone else joins
		}
		else //1player
		{
			this.activeAI=true;
			
			
		}
		//this.pongManager.connectPlayer(new Player(false));
		//this.pongManager.connectPlayer(new Player(activeAI));


	}
//play sound
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
//initiate
	start()
	{
		
		requestAnimationFrame(this.callback);
	}
//move ball, check for collisions
	simulate(dt)
	{
		//move ball
		if(!this.isPaused)
		{
			const vel=this.ball.vel;
			this.ball.pos.x+=vel.x*dt;
			this.ball.pos.y+=vel.y*dt;

			if(this.activeAI===true && !this.isPaused)//animate Ai
			{
				this.moveAI();
			}
			if(this.ball.left<0 || this.ball.right>this._canvas.width)//in either net
			{
				const playerId=vel.x<0|0;
				const player =this.players[playerId];
				player.goal(this.aiSpeed);
				if(player.score<9)
				{
					if(this.ball.left<0){

						if(playerId===1)
						{
							this.sound("score");
						}
						else
						{
							this.sound("miss");
						}
					}
					else if(this.ball.right>this._canvas.width)
					{
						
						if(playerId===0)
						{
							this.sound("score");
						}
						else
						{
							this.sound("miss");
						}
					}
					player.score++;
					
				}
				else if(player.score>=9)
				{

					if(playerId===0)
					{
						this.sound("win");
						window.setTimeout(function(){alert('Player One Wins')},1500);
						this.players[1].points=0;
					}
					else if(playerId===1)
					{
						this.sound("lose");
						window.setTimeout(function(){alert('Player Two Wins')},1000);
						this.players[0].points=0;
					}
					this.players.forEach(player =>{
						player.reset();
						player.score=0;
					});
				}
				this.reset();
				
			}
		
			if(this.ball.top<0)//bounce top
			{
				this.ball.pos.y=this.ball.bottom;
				this.velY*=-1;
					this.ball.vel.y=this.velY;
				this.sound("wall");
				
			}
			else if(this.ball.bottom>this._canvas.height)//bounce bottom
			{
				this.ball.pos.y=this.ball.top;
				this.velY*=-1;
					this.ball.vel.y=this.velY;
				this.sound("wall");
			}
			//update players
			this.players.forEach(player =>{
				player.update(dt);

				this.collide(player, this.ball);

			});
			//console.log(this.p1move+":"+this.players[0].vel.y);
			if(this.p1move!=0)
			{
				this.movePlayer(this.players[0], this.p1move);
			}
			//console.log(this.p2move+":"+this.players[1].vel.y);
			if(this.p2move!=0)
			{
				this.movePlayer(this.players[1], this.p2move);
			}
		}
		
	}
//keep time
	update(dt)
	{
		this._accumulator+= dt;
		while (this._accumulator>this.step)
		{
			this.simulate(this.step);
			this._accumulator-=this.step;
		}
	}
	Players(players)
	{
		this.vs=players;
	}
}
const canvas=document.getElementById('pong');
const difficulties=document.getElementsByClassName('difficulty');
const players=document.getElementsByClassName('vs');
canvas.style.position="center";
const pong=new Pong(canvas);

pong.Players(players);
pong.setPlayers(players);
canvas.addEventListener('mousemove',event =>
{
	const scale=event.offsetY/event.target.getBoundingClientRect().height;
	pong.players[0].move(canvas.height*scale);
});
canvas.addEventListener('click',event =>
{
	pong.play();
});

document.onkeydown = checkKey;
document.onkeyup = checkRelease;
function checkKey(e) {

    e = e || window.event;
    //console.log(e);
    if (e.keyCode == '27') //ESC key
    {

		
        pong.reset();
    }
    else if(e.keyCode=='13')
    {
    	pong.play();
    }
    else {pong.keyPress(e)}

}
function checkRelease(e)
{
	e=e || window.event;
	//console.log(e);
	if(e.keyCode=='87' || e.keyCode=='83' || e.keyCode=='38' || e.keyCode=='40')
		{pong.keyRelease(e);}
}
pong.start();

