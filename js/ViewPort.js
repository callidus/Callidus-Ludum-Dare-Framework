
function ViewPort( x, y, w, h, ctx )
{
	this.hasMargin = false;
	this.delta = 33.3;
	this.context = ctx;
	this.rect = new Rect2D( x, y, w, h );
	this.pxOffset = new Point2D( 0, 0 );
	this.targ = new Point2D( 0, 0 );
	
	
	// -----------------------------------------------------------------
	// render a tile map using the viewport
	// -----------------------------------------------------------------
	this.renderMap = function( map )
	{
		this.update( map );
		
		var x = this.rect.getX();
		var y = this.rect.getY();
		var tW = Math.min( x + this.rect.w, map.width );
		var tH = Math.min( y + this.rect.h, map.height );
		
		for( j=y; j<tH; ++j )
		{
			for( i=x; i<tW; ++i )
			{
				var idx = j * map.width + i;
				if( map.dirtyFlags[idx] )
				{
					map.dirtyFlags[idx] = 0;
					map.gfx.draw( this.context, 
						( i - x ) * map.gfx.tileW - this.pxOffset.x,
						( j - y ) * map.gfx.tileH - this.pxOffset.y,
						map.tileData[LVL_GFX][idx] );
				}
			}
		}
	}
	
	// -----------------------------------------------------------------
	// render a tile sprite using the viewport
	// -----------------------------------------------------------------
	this.renderSprite = function( sprt, map )
	{
		sprt.updateAnim( this.delta );
		if( sprt.isMoving() )
		{
			var hit = this.calcSlide(	sprt.rect.point, sprt.targ, 
										sprt.speed, sprt.pxOffset, 
										map );
			if( hit )
			{
				sprt.rect.point.x = sprt.targ.x;
				sprt.rect.point.y = sprt.targ.y;
			}
			
			sprt.setDirty();
		}
		
		
		if( sprt.isDirty() )
		{	
			var x  = this.rect.getX();
			var y  = this.rect.getY();
			var sx = sprt.rect.getX() - x;
			var sy = sprt.rect.getY() - y;
			var sw = Math.min( sprt.rect.w, this.rect.w - sx );
			var sh = Math.min( sprt.rect.h, this.rect.h - sy );
			var idx = 0;
			
			for( j=0; j<sh; ++j )
			{
				for( i=0; i<sw; ++i )
				{
					var frame = sprt.getAnimFrame( i, j );
					
					idx = ( j + y + sy ) * map.width + i + x + sx;
					map.gfx.draw( this.context,
						( i + sx ) * map.gfx.tileW - this.pxOffset.x,
						( j + sy ) * map.gfx.tileH - this.pxOffset.y,
						map.tileData[LVL_GFX][idx] );
						
					idx = ( j + sprt.targ.y ) * map.width + i + sprt.targ.x;
					map.gfx.draw( this.context,
						( i + sprt.targ.x - x ) * map.gfx.tileW - this.pxOffset.x,
						( j + sprt.targ.y - y ) * map.gfx.tileH - this.pxOffset.y,
						map.tileData[LVL_GFX][idx] );
							
					sprt.gfx.draw( this.context, 
						( i + sx ) * map.gfx.tileW - this.pxOffset.x + sprt.pxOffset.x,
						( j + sy ) * map.gfx.tileH - this.pxOffset.y + sprt.pxOffset.y,
						frame );
					
					// TODO: actually make multi-tile sprites work ....
				}
			}
			
			sprt.clearDirty();
		}
	}
	
	// -----------------------------------------------------------------
	// per-pixel slide from a to b
	// -----------------------------------------------------------------
	this.calcSlide = function( now, trg, spd, pos, map )
	{
		var tmp = spd * ( this.delta / 1000.0 );
		var osX = trg.x - now.x;
		var osY = trg.y - now.y;
		
		pos.x += osX * tmp;
		pos.y += osY * tmp;
		
		if( ( Math.abs( osX * map.gfx.tileW ) < Math.abs( pos.x ) ) ||
			( Math.abs( osY * map.gfx.tileH ) < Math.abs( pos.y ) ) )
		{
			pos.x = 0;
			pos.y = 0;
			return true;
		}
		
		return false;
	}
	
	// -----------------------------------------------------------------
	// display at a given point 
	// -----------------------------------------------------------------
	this.viewAt = function( pnt, map )
	{
		this.rect.point.x = pnt.x;
		this.rect.point.y = pnt.y;
		this.pxOffset.x = 0;
		this.pxOffset.y = 0;
		this.targ.x = pnt.x;
		this.targ.y = pnt.y;
		
		map.setDirtyRect( this.rect );
	}
	
	// -----------------------------------------------------------------
	// scroll by an offset
	// -----------------------------------------------------------------
	this.scrollBy = function( pnt )
	{
		this.targ.x = this.rect.getX() + pnt.x;
		this.targ.y = this.rect.getY() + pnt.y;
		
		if( !this.hasMargin  )
		{
			this.hasMargin = true;
			this.rect.w += 1;		
			this.rect.h += 1;
		}
	}
	
	this.update = function( map )
	{
		var ret = false;
		if( this.targ.x != this.rect.getX() || 
			this.targ.y != this.rect.getY() )
		{
			if( this.calcSlide( this.rect.point, this.targ, 100, 
								this.pxOffset, map ) )
			{
				this.rect.point.x = this.targ.x;
				this.rect.point.y = this.targ.y;
				
				this.hasMargin = false;
				this.rect.w -= 1;
				this.rect.h -= 1;
			}
			else
			{
				ret = true;
			}
			
			map.setDirtyRect( this.rect );
		}
		
		return ret;
	}
}

