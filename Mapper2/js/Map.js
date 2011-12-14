/*
 * <!--
(c) 2011 Tim Kelsey
distributedunder the terms of the MIT licence 
please see licence.txt
-->
 */


var LVL_GFX = 0;
var LVL_PHY = 1;
var LVL_SFX = 2;
var LVL_MAX = 3;

// ---------------------------------------------------------------------
// a map
// ---------------------------------------------------------------------
function TileMap( tileGfx, w, h )
{	
	this.viewPort = new Rect2D( 0, 0, 0, 0 );
	this.width = w;
	this.height = h;
	
	this.gfx = tileGfx;
	this.tileData = new Array();
	for( i=0; i<LVL_MAX; ++i )
	{
		this.tileData[i] = null;
	}
	
	this.dirtyFlags = new Array();

	// what to draw
	this.setData = function( data )
	{
		for( i=0; i<LVL_MAX; ++i )
		{
			this.tileData[i] = data[i];
		}
		this.refresh();
	}
	
	this.setViewPortRect = function( rect )
	{
		this.viewPort.setRect( rect );
	}
	
	// refresh
	this.refresh = function()
	{
		for( i=0; i<this.tileData[LVL_GFX].length; ++i )
		{
			this.dirtyFlags[i] = 1;
		}
	}
	
	// dirty
	this.setDirtyIdx = function( idx )
	{
		this.dirtyFlags[idx] = 1;
	}
	
	// dirty in a rect
	this.setDirtyRect = function( rect )
	{
		var tX;
		var tY;
		var idx;
		
		tY = rect.getY() + rect.h;
		for( j=rect.getY(); j<tY; ++j )
		{
			tX = rect.getX() + rect.w;
			for( i=rect.getX(); i<tX; ++i )
			{
				idx = j * this.width + i;
				this.dirtyFlags[ idx ] = 1;
			}
		}
	}
	
	// scroll the view port 
	this.scrollViewPort = function( x, y )
	{
		var idx;
		var tH;
		var tW;	
		
		// clamp X
		tW = x + this.viewPort.getX() + this.viewPort.w;
		if( tW > this.width || x + this.viewPort.getX() < 0 )
		{
			x = 0;
		}
		
		// clamp Y
		tH = y + this.viewPort.getY() + this.viewPort.h;
		if( tH > this.height || y + this.viewPort.getY() < 0 )
		{
			y = 0;
		}
		
		if( x == 0 && y == 0 )
		{
			return 0;
		}
		
		this.viewPort.point.x += x;
		this.viewPort.point.y += y;
		this.setDirtyRect( this.viewPort );
		return 1;
	}
	
	//
	this.scrollToIndex = function( idx )
	{
		var p = new Point2D( 0, 0 );
		p.fromIdx( idx, this.width, this.height );
		
		this.viewPort.point.x = p.x - 1;
		this.viewPort.point.y = p.y - 1;
		this.setDirtyRect( this.viewPort );
	}
	
	// is in viewport
	this.isVisible = function( rect )
	{
		var p1 = rect.getPoint();
		var p2 = rect.getExtent();
		
		// test
		if( this.viewPort.contains( p1 ) || 
			this.viewPort.contains( p2 ) )
		{
			return true;
		}
		return false;
	}
	
	this.findSfx = function( idx, find )
	{
		for( i=idx; i<this.tileData[LVL_SFX].length; ++i )
		{
			if( this.tileData[LVL_SFX][i] == find )
			{
				return i;
			}
		}
		return null;
	}
	

}
