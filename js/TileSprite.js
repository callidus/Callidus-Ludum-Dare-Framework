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
// move policy - slide from tile to tile over time
// ---------------------------------------------------------------------
function MovePolicy_slide()
{
	this.delta = 0.0;
	this.moveLen = 0.0;
	this.moveDir = new Point2D( 0, 0 );
	this.moveTrg = new Point2D( 0, 0 );
	
	this.setMove = function( from, to )
	{
		this.moveTrg.x = to.x;
		this.moveTrg.y = to.y;
		
		// build move vector
		this.moveDir.x = to.x - from.x;
		this.moveDir.y = to.y - from.y;
		this.moveLen = Math.sqrt(	this.moveDir.x * this.moveDir.x +
									this.moveDir.y * this.moveDir.y );
					
		// normalise move vector for direction							
		this.moveDir.x /= this.moveLen;
		this.moveDir.y /= this.moveLen;
		
	}
	
	this.update = function( delta, pos, speed )
	{		
		var tmp = speed * ( delta / 1000.0 );
		this.moveLen -= tmp;
		
		pos.x += ( this.moveDir.x * tmp );
		pos.y += ( this.moveDir.y * tmp );
		
		if( this.moveLen < 0 )
		{
			this.moveLen = 0.0;
			pos.x = this.moveTrg.x;
			pos.y = this.moveTrg.y;		
		}
	}
	
	this.isMoving = function()
	{
		return this.moveLen > 0.0;
	}	
}

// ---------------------------------------------------------------------
// move policy - snap from tile to tile
// ---------------------------------------------------------------------
function MovePolicy_snap()
{
	this.needMove = false;
	this.moveTrg = new Point2D( 0, 0 );
	
	this.isMoving = function()
	{
		return this.needMove;
	}
	
	this.setMove = function( from, to )
	{
		this.moveTrg.x = to.x;
		this.moveTrg.y = to.y;
		this.needMove = true;
	}
	
	this.update = function( delta, pos, speed )
	{
		pos.x = this.moveTrg.x;
		pos.y = this.moveTrg.y;
		this.needMove = false;
	}
}


// ---------------------------------------------------------------------
// a tile sprite, it can move and animate
// ---------------------------------------------------------------------
function TileSprite( gfx, move )
{
	this.gfx = gfx;
	this.runNum = 0;
	this.runNow = 0;
	this.dirty = 0;
	
	this.pos = new Point2D( 0, 0 );
	this.speed = 0.5;
	
	this.runs = new Array();
	this.animDelta = 0.0;
	this.moveDelta = 0.0;
	
	this.isDirty = function()
	{
		return this.dirty;
	}
	
	this.setPosition = function( pos )
	{
		this.pos = pos
	}
	
	// moving stuff
	this.move = move;
	
	this.isMoving = function()
	{
		return this.move.isMoving();
	}
	
	this.setMoveTo = function( targ )
	{
		this.move.setMove( this.pos, targ );
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
		if( this.move.isMoving() )
		{			
			this.move.update( delta, this.pos, this.speed );
			this.dirty = true;
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
