

function SideBar()
{
	// hooks for app
	this.viewPort = null;
	this.tileGraphic = null;
	this.tileMap = null;
	this.w = 0;
	this.h = 0;
	this.mapData = new Array;
	this.canvas = null;
	this.context = null;
	this.pickIdx = 0;
	this.selectIdx = 0;
	this.selectIdxNotify = null;

	
	this.onLoad = function( inst )
	{
		return function( e )
		{
			var j = ( inst.h * inst.w );
			for( i=0; i<j; ++i )
			{
				inst.mapData[i] = i+1;
			}
			
			j /= 3;
			inst.tileGraphic = new TileGraphic( e.target.result, inst.h, inst.w );
			inst.tileMap = new TileMap( inst.tileGraphic, 3, j );
			inst.tileMap.setData( inst.mapData );
			
			inst.canvas.width = 3 * inst.tileGraphic.tileRealW 
			inst.canvas.height = j * inst.tileGraphic.tileRealH 
			
			inst.viewPort = new ViewPort( 1, 1, 3, j, inst.context );
			inst.tileMap.refresh();
			inst.draw();
		};
	}
	

	this.setup = function( c )
	{
		this.canvas   = c;
		this.context  = c.getContext( '2d' );
		c.onmousemove = this.onMouseMove( this );
		c.onmouseup   = this.onMouseUp( this );
	}
	
	
	this.draw = function()
	{
		this.viewPort.renderMap( this.map );
	}
	
	
	this.onMouseMove = function( inst )
	{
		return function( e )
		{
			var idx = inst.tileMap.pointToTile( e.offsetX, e.offsetY );
			var rct = inst.tileMap.getTilePos( idx );
			
			if( idx != inst.pickIdx )
			{
				inst.tileMap.setDirty( inst.pickIdx );
				inst.pickIdx = idx;
				inst.draw();
				
				inst.context.fillStyle = "rgba(255,0,0,0.5)";
				inst.context.fillRect( rct.x, rct.y, rct.w, rct.h );
			}
		}
	}
	
	this.onMouseUp = function( inst )
	{
		return function( e )
		{
			inst.selectIdx = inst.pickIdx;
			if( inst.selectIdxNotify )
			{
				inst.selectIdxNotify( inst.selectIdx );
			}
		}
	}
}
