

function MainView()
{
	this.canvas = null;
	this.context = null;
	this.tileGraphic = null;
	this.tileMap = null;
	this.mapData = new Array();
	
	this.width = 0;
	this.height = 0;
	this.down = false;
	this.tileIdx = 0;
	this.pickIdx = 0;
	
	this.setup = function( canvas, gfx, w, h )
	{
		this.canvas = canvas;
		this.canvas.onmousemove = this.onMouseMove( this );
		this.canvas.onmousedown = this.onMouseDown( this );
		this.canvas.onmouseup   = this.onMouseUp( this );
		this.context = canvas.getContext( '2d' );
		this.gfx = gfx;
		this.canvas.width = w * gfx.tileRealW;
		this.canvas.height = h * gfx.tileRealH;
		this.canvas.style.width = w * gfx.tileRealW;
		this.canvas.style.height = h * gfx.tileRealH;
		
		
		for( i = 0; i<w*h; ++i )
		{
			this.mapData[i] = 1;
		}
		this.tileMap = new TileMap( gfx, w, h );
		this.tileMap.setData( this.mapData );
		this.draw();
	}
	
	
	this.draw = function()
	{
		this.tileMap.draw( this.context );
		this.context.fillStyle = "rgba(255,0,0,0.5)";
		
		var rct = this.tileMap.getTilePos( this.pickIdx );
		this.context.fillRect( rct.x, rct.y, rct.w, rct.h );
	}
	
	
	this.onMouseMove = function( inst )
	{
		return function( e )
		{
			var idx = inst.tileMap.pointToTile( e.offsetX, e.offsetY );
			var rct = inst.tileMap.getTilePos( idx );
			
			if( inst.down )
			{
				inst.mapData[idx] = inst.tileIdx +1; // FIXME!
				inst.tileMap.setDirty( idx );
			}
			
			if( idx != inst.pickIdx )
			{
				inst.tileMap.setDirty( inst.pickIdx );
				inst.pickIdx = idx;
				inst.draw();
			}
		}
	}
	
	this.onMouseDown = function( inst )
	{
		return function( e )
		{
			inst.down = true;
			inst.mapData[inst.pickIdx] = inst.tileIdx +1; // FIXME!
			inst.tileMap.setDirty( inst.pickIdx );
			inst.draw();
		}
	}
	
	this.onMouseUp = function( inst )
	{
		return function( e )
		{
			inst.down = false;
		}
	}
	
	this.onSelectIdx = function( inst )
	{
		return function( idx )
		{
			inst.tileIdx = idx;
		}
	}
}

