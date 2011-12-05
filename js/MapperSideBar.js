

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
			inst.mapData[LVL_GFX] = new Array();
			inst.mapData[LVL_PHY] = null;
			inst.mapData[LVL_SFX] = null;
			
			for( i=0; i<j; ++i )
			{
				inst.mapData[LVL_GFX][i] = i;
			}
			
			j /= 3;
			inst.tileGraphic = new TileGraphic( e.target.result, inst.h, inst.w );
			inst.tileMap = new TileMap( inst.tileGraphic, 3, j );
			inst.tileMap.setData( inst.mapData );
			
			inst.canvas.width = 3 * inst.tileGraphic.tileRealW 
			inst.canvas.height = j * inst.tileGraphic.tileRealH 
			
			inst.viewPort = new ViewPort( 0, 0, 3, j, inst.context );
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
		this.viewPort.renderMap( this.tileMap );
	}
	
	
	this.onMouseMove = function( inst )
	{
		return function( e )
		{
			var w = inst.tileMap.width;
			var h = inst.tileMap.height;
			
			var pnt = new Point2D( e.offsetX, e.offsetY );
			pnt.clampToTile( w, h );
			
			var idx = pnt.asIdx( w, h );
			var rct = new Rect2D( pnt.x, pnt.y, 
									inst.tileMap.gfx.tileW,
									inst.tileMap.gfx.tileH );
			
			if( idx != inst.pickIdx )
			{
				inst.tileMap.setDirtyIdx( inst.pickIdx );
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
