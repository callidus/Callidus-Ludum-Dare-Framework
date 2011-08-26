

var LVL_GFX = 0;
var LVL_PHY = 1;
var LVL_SFX = 2;
var LVL_MAX = 3;

// ---------------------------------------------------------------------
// a map
// ---------------------------------------------------------------------
function TileMap( tileGfx, w, h )
{	
	this.width = w;
	this.height = h;
	
	this.pxWidth = tileGfx.tileW * w
	this.pxHeight = tileGfx.tileH * h
	
	this.tileData = new Array();
	for( i=0; i<LVL_MAX; ++i )
	{
		this.tileData[i] = null;
	}
	
	this.tileData
	this.tileGfx = tileGfx;
	
	this.dirtyFlags = new Array();
	this.viewPort = new Rect2D();
	
	// what to draw
	this.setData = function( data )
	{
		for( i=0; i<LVL_MAX; ++i )
		{
			this.tileData[i] = data[i];
		}
		this.refresh();
	}
	
	this.setViewport = function( w, h )
	{
		this.viewW = w;
		this.viewY = y;
	}
	
	// refresh
	this.refresh = function()
	{
		var idx = 0;
		for( i=0; i<this.height; ++i )
		{
			for( j=0; j<this.width; ++j )
			{
				this.dirtyFlags[ i * this.width + j ] = 1;
			}
		}
	}
	
	// dirty
	this.setDirty = function( idx )
	{
		this.dirtyFlags[idx] = 1;
	}
	
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
	{
		var rect = new Rect2D();
		var tX = Math.floor( idx % this.pxWidth );
		var tY = Math.floor( idx / this.pxWidth );
		
		rect.x = tX * this.tileGfx.tileW;
		rect.y = tY * this.tileGfx.tileH;
		rect.w = this.tileGfx.tileW;
		rect.h = this.tileGfx.tileH;
		
		return rect;
	}
	
	// setup a veiw port onto the map
	this.setViewPort = function( rect )
	{
		this.viewPort = rect;
	}
	
	// scroll the view port 
	this.scrollViewPort = function( x, y )
	{
		var idx;
		var tH;
		var tW;	
		
		// clamp X
		tW = x + this.viewPort.x + this.viewPort.w;
		if( tW > this.width || x + this.viewPort.x < 0 )
		{
			x = 0;
		}
		
		// clamp Y
		tH = y + this.viewPort.y + this.viewPort.h;
		if( tH > this.height || y + this.viewPort.y < 0 )
		{
			y = 0;
		}
		
		if( x == 0 && y == 0 )
		{
			return 0;
		}
		
		this.viewPort.x += x;
		this.viewPort.y += y;
		
		tH = this.viewPort.y + this.viewPort.h;
		for( j=this.viewPort.y; j<tH; ++j )
		{
			tW = this.viewPort.x + this.viewPort.w;
			for( i=this.viewPort.x; i<tW; ++i )
			{
				idx = j * this.width + i;
				this.dirtyFlags[ idx ] = 1;
			}
		}
		
		return 1;
	}
	
	// draw stuff, render the minimum number of tiles we have to
	this.draw = function( ctx )
	{
		var tH;
		var tW;
		var idx;
		
		idx = 0;
		tH = this.viewPort.y + this.viewPort.h;
		for( i=this.viewPort.y; i<tH; ++i )
		{
			tW = this.viewPort.x + this.viewPort.w;
			for( j=this.viewPort.x; j<tW; ++j )
			{
				idx = i * this.width + j;
				if( this.dirtyFlags[idx] )
				{
					this.dirtyFlags[idx] = 0;
					this.tileGfx.draw( ctx, 
										( j - this.viewPort.x ) * this.tileGfx.tileW,
										( i - this.viewPort.y ) * this.tileGfx.tileH,
										this.tileData[LVL_GFX][idx] );
				}
			}
		}
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
	
	this.scrollToIndex = function( idx )
	{
		var tX = Math.floor( idx % this.width );
		var tY = Math.floor( idx / this.width );
		this.viewPort.x = tX-1;
		this.viewPort.y = tY-1;
		
		// factor out -------------------------------------------------
		tY = this.viewPort.y + this.viewPort.h;
		for( j=this.viewPort.y; j<tY; ++j )
		{
			tX = this.viewPort.x + this.viewPort.w;
			for( i=this.viewPort.x; i<tX; ++i )
			{
				idx = j * this.width + i;
				this.dirtyFlags[ idx ] = 1;
			}
		}
		// ------------------------------------------------------------
	}
}
