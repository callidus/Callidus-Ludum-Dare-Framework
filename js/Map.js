

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
	
<<<<<<< HEAD
	// dirty in a rect
	this.setDirtyRect = function( rect )
=======
	this.setDirtyRectPx = function( rect )
	{
		idx = this.pointToTileIdxVP( rect.x, rect.y );
		this.dirtyFlags[idx] = 1;

		idx = this.pointToTileIdxVP( rect.x + rect.w, rect.y );
		this.dirtyFlags[idx] = 1;

		idx = this.pointToTileIdxVP( rect.x, rect.y + rect.h );
		this.dirtyFlags[idx] = 1;

		idx = this.pointToTileIdxVP( rect.x + rect.w, rect.y + rect.h );
		this.dirtyFlags[idx] = 1;
	}
	
	
	// get a tile idx from a 2D point on the map
	this.pointToTileIdx = function( x, y )
	{
		var tX = Math.floor( x / this.tileGfx.tileW );
		var tY = Math.floor( y / this.tileGfx.tileH );
		return w * tY + tX;
	}
	
	
	// get a tile idx from a 2D point on the map, take into account scrolling
	this.pointToTileIdxVP = function( x, y )
	{
		var tX = Math.floor( ( x + this.viewPort.x * this.tileGfx.tileW ) / this.tileGfx.tileW );
		var tY = Math.floor( ( y + this.viewPort.y * this.tileGfx.tileH ) / this.tileGfx.tileH );
		return w * tY + tX;
	}
	
	
	// get a point ( rect ) in 2D space from a tile idx 
	this.tileIdxToPoint = function( idx )
>>>>>>> e3fc341d6d878ca0ec9da90eeb64261437a81a4d
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
