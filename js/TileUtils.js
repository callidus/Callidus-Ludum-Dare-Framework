
// ---------------------------------------------------------------------
// a 2D point
// ---------------------------------------------------------------------
function Point2D( x, y )
{
	this.x = x;
	this.y = y;
	
	// convert XY point into an index
	this.asIdx = function( w, h )
	{
		return w * this.y + this.x;
	}

	// set XY values from an index
	this.fromIdx = function ( idx, w, h )
	{
		this.y = Math.floor( idx / w );
		this.x = Math.floor( idx % w );
	}
	
	//
	this.clampToTile = function( w, h )
	{
		this.x = Math.floor( this.x / w );
		this.y = Math.floor( this.y / h );
	}
	
	//
	this.clone = function()
	{
		return new Point2D( this.x, this.y );
	}
}

// ---------------------------------------------------------------------
// a 2D rect
// ---------------------------------------------------------------------
function Rect2D( x, y, w, h )
{
	this.point = new Point2D( x, y );
	this.w = w;
	this.h = h;
	
	this.set = function( x, y, w, h )
	{
		this.point.x = x;
		this.point.y = y;
		this.w = w;
		this.h = h;
	}
	
	this.setRect = function( r )
	{
		this.point.x = r.point.x;
		this.point.y = r.point.y;
		this.w = r.w;
		this.h = r.h;
	}
	
	this.getX = function()
	{
		return this.point.x;
	}
	
	this.getY = function()
	{
		return this.point.y;
	}
	
	this.getExtent = function()
	{
		return new Point2D( this.point.x + this.w, 
							this.point.y + this.h );
	}
	
	this.getPoint = function()
	{
		return new Point2D( this.point.x, this.point.y );
	}
	
	this.contains = function( pnt )
	{
		if( ( pnt.x >= this.point.x && pnt.x < this.point.x + this.w ) &&
			( pnt.y >= this.point.y && pnt.y < this.point.y + this.h ) )
		{
			return true;
		}
		return false;
	}
	
	this.clone = function()
	{
		return new Rect2D( this.point.x, this.point.y, this.w, this.h );
	}
	
	this.clampToTile = function( w, h )
	{
		this.point.clampToTile( w, h );
		this.w = Math.max( 1, Math.floor( this.w / w ) );
		this.h = Math.max( 1, Math.floor( this.h / h ) );
	}
}


