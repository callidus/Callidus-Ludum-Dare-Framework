
// ---------------------------------------------------------------------
// a 2D point
// ---------------------------------------------------------------------
function Point2D( x, y )
{
	this.x = x;
	this.y = y;
}

// ---------------------------------------------------------------------
// a 2D rect
// ---------------------------------------------------------------------
function Rect2D( x, y, w, h )
{
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
}

// ---------------------------------------------------------------------
// a tile graphic
// ---------------------------------------------------------------------
function TileGraphic( img, rows, cols )
{
	this.rows = rows;
	this.cols = cols;
	
	this.img = new Image();
	this.img.src = img;
	
	this.tileW = this.img.width / cols;
	this.tileH = this.img.height / rows;
	
	this.tileRealW = this.tileW;
	this.tileRealH = this.tileH;
	this.offset = 0;
	
	// trim off any boarders
	this.setBoarder = function( px )
	{
		this.offset = px;
		this.tileW = this.tileRealW - px * 2; 
		this.tileH = this.tileRealH - px * 2;
	}
	
	// we need to draw stuff
	this.draw = function( ctx, dX, dY, idx )
	{
		var sX = this.tileRealW * Math.floor( idx % this.cols );
		var sY = this.tileRealH * Math.floor( idx / this.cols );
		
		ctx.drawImage( this.img,
						sX + this.offset, sY + this.offset, this.tileW, this.tileH,
						dX, dY, this.tileW, this.tileH );
	}
}

// ---------------------------------------------------------------------
// an animation data struct
// ---------------------------------------------------------------------
function TileAnimationRun()
{
	this.first = 0;
	this.frame = 0;
	this.last = 0;
	this.fps = 30;
	this.loop = 1;
}

// ---------------------------------------------------------------------
// a tile sprite, it can move and animate
// ---------------------------------------------------------------------
function TileSprite( gfx )
{
	this.gfx = gfx;
	this.runNum = 0;
	this.runNow = 0;
	this.dirty = 0;
	
	this.pos = new Point2D( 0, 0 );
	this.moveDir = new Point2D( 0, 0 );
	this.targ = new Point2D( 0, 0 );
	
	this.runs = new Array();
	this.animDelta = 0.0;
	this.moveDelta = 0.0;
	
	this.moveLen = 0.0;
	this.speed = 0.5;
	
	this.isDirty = function()
	{
		return this.dirty;
	}
	
	this.setPosition = function( pos )
	{
		this.pos = pos
	}
	
	this.setMoveTo = function( pos )
	{
		// build move vector
		this.moveDir.x = pos.x - this.pos.x;
		this.moveDir.y = pos.y - this.pos.y;
		this.moveLen = Math.sqrt( 	this.moveDir.x * this.moveDir.x +
									this.moveDir.y * this.moveDir.y );
					
		// normalise move vector for direction							
		this.moveDir.x /= this.moveLen;
		this.moveDir.y /= this.moveLen;
		
		this.targ.x = pos.x;
		this.targ.y = pos.y;
	}
	
	this.isMoving = function()
	{
		return this.moveLen > 0;
	}
	
	this.addRun = function( run )
	{
		run.frame = run.first
		this.runs[ this.runNum ] = run
		this.runNum++;
	}
	
	this.setRun = function( idx )
	{
		this.runNow = idx;
		this.runs[idx].frame = this.runs[idx].first;
		this.animDelta = 0.0;
	}
	
	var snd = new Audio("snd/step.wav");
	snd.volume = 0.1;
	
	this.update = function( delta )
	{
		// anim stuff
		if( this.runNum )
		{
			this.animDelta += delta;
			this.moveDelta += delta;
			
			var run = this.runs[ this.runNow ];
			if( this.animDelta >= ( 1000.0 / run.fps ) )
			{
				this.animDelta = 0.0;
				if( run.frame == run.last )
				{
					if( run.loop )
					{
						run.frame = run.first;
					}
				}
				else
				{
					run.frame++;
					
					snd.play();
				}
				
				this.dirty = 1;
			}
		}
		
		// move stuff
		if( this.moveLen )
		{			
			var tmp = this.speed * ( delta / 1000.0 );
			this.moveLen -= tmp;
			this.pos.x += ( this.moveDir.x * tmp );
			this.pos.y += ( this.moveDir.y * tmp );
			
			if( this.moveLen < 0 )
			{
				this.moveLen = 0;
				this.pos.x = this.targ.x;
				this.pos.y = this.targ.y;
			}
		}
	}
	
	this.getBounds = function()
	{
		var rect = new Rect2D();
		rect.x = this.pos.x;
		rect.y = this.pos.y;
		rect.w = this.gfx.tileW;
		rect.h = this.gfx.tileH;
		return rect;
	}
	
	this.draw = function( ctx )
	{
		this.gfx.draw( ctx, this.pos.x,this.pos.y, this.runs[ this.runNow ].frame );
		this.dirty = 0;
	}
}



