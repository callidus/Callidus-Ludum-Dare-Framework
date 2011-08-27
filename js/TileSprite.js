
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
	this.sound = null;
}

// ---------------------------------------------------------------------
// a tile sprite, it can move and animate
// ---------------------------------------------------------------------
function TileSprite( gfx, move, anim )
{
	this.gfx = gfx;
	this.dirty = 0;
	
	this.pxOffset = new Point2D( 0, 0 );
	this.rect = new Rect2D( 0, 0, 1, 1 );
	this.targ = new Point2D( 0, 0 );
	this.speed = 0.5;
	
	this.delta = 0.0;
	this.runNow = 0;
	this.runs = new Array();
	
	this.isMoving = function()
	{
		return (	this.targ.x != this.rect.getX() || 
					this.targ.y != this.rect.getY() );
	}
	
	this.setMoveTo = function( targ )
	{
		this.targ.x = targ.x;
		this.targ.y = targ.y;
	}
	
	this.addAnimRun = function( run )
	{
		run.frame = run.first;
		this.runs.push( run )
	}
	
	this.setAnimRun = function( idx )
	{
		this.runs[idx].frame = this.runs[idx].first;
		this.runNow = idx;
		this.dirty = true;
	}
	
	this.updateAnim = function( delta )
	{
		if( this.runs.length )
		{
			var run = this.runs[this.runNow];
			if( run.frame == run.last && !run.loop )
			{
				return;
			}
			
			this.delta += delta;
			if( this.delta >= ( 1000.0 / run.fps ) )
			{
				this.delta = 0.0;
				if( run.frame == run.last )
				{
					run.frame = run.first;
				}
				else
				{
					run.frame++;
				}
				
				if( run.sound != null )
				{
					run.sound.play();
				}
				
				this.dirty = true;
			}
		}
	}
	
	this.getAnimFrame = function( x, y )
	{
		return this.runs[this.runNow].frame;
	}
	
	this.setPosition = function( pos )
	{
		this.rect.point.x = pos.x;
		this.rect.point.y = pos.y;
		this.targ.x = pos.x;
		this.targ.y = pos.y;
		this.pxOffset.x = 0;
		this.pxOffset.y = 0;
	}
	
	this.setMoveTo = function( trg )
	{
		this.targ.x = trg.x;
		this.targ.y = trg.y;
	}
	
	this.isDirty = function()
	{
		return this.dirty;
	}
	
	this.setDirty = function()
	{
		this.dirty = true;
	}
	
	this.clearDirty = function()
	{
		this.dirty = false;
	}
}
