

// -- tile browser object ----------------------------------------------
function TileBrowser() 
{
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
	this.tileValue = 0;
	this.statusBar = null
	
	this.finaliseLoad = function( gfx )
	{
		this.statusBar = document.getElementById( "status_bar" );
		this.tileMenu = document.getElementById( "tile_menu" );
		this.canvas = document.getElementById( "tile_canvas" );
		this.context  = this.canvas.getContext( '2d' );
		this.context.mozImageSmoothingEnabled = false; // fix image smoothing on ff
		
		var j = ( this.h * this.w );
		this.mapData[0] = new Array();
		
		for( i=0; i<j; ++i )
		{
			this.mapData[0][i] = i;
		}
		
		j /= 3;
		this.tileGraphic = gfx;
		this.tileMap = new TileMap( this.tileGraphic, 3, j );
		this.tileMap.setData( this.mapData );
		
		this.canvas.width = 3 * this.tileGraphic.tileRealW 
		this.canvas.height = j * this.tileGraphic.tileRealH 
		
		this.viewPort = new ViewPort( 0, 0, 3, j, this.canvas );
		this.tileMap.refresh();
		this.show();
		this.draw();
		
		this.canvas.onmousemove		= this.onMouseMove( this );
		this.canvas.onmouseup		= this.onMouseUp( this );
		this.tileMenu.onmouseout	= this.onMouseOut( this );
		
		this.selectIdx = 0;
		this.drawSelection();

		// gMenuTab from Menu.js - i dont like this being here
		// i also dont like using hard coded id values
		gMenuTab["new_map"].enable( "newMap('new_map_menu','new_map_form')" );
		gMenuTab["open_map"].enable( "loadMap('load_map_menu','load_map_form')" );
	}
	
	this.draw = function()
	{
		this.viewPort.renderMap( this.tileMap, 0 );
	}
	
	this.show = function()
	{
		this.tileMenu.style.visibility = 'visible';
		this.tileMenu.style.display = 'block';
	}
	
	this.hide = function()
	{
		this.tileMenu.style.visibility = 'hidden';
		this.tileMenu.style.display = 'none';
	}
	
	this.onMouseMove = function( inst )
	{
		return function( e )
		{
			var w = inst.tileMap.gfx.tileW;
			var h = inst.tileMap.gfx.tileH;
			
			var x = e.offsetX;
			var y = e.offsetY;
			if( x == undefined )
			{
				x = e.layerX;
				y = e.layerY;
			}
			
			var pnt = new Point2D( x, y );
			pnt.toTile( w, h );
			
			var idx = pnt.asIdx( inst.tileMap.width, inst.tileMap.height );
			var rct = new Rect2D( pnt.x, pnt.y, w, h );
			
			if( idx != inst.pickIdx || inst.refresh )
			{	
				var old = new Point2D();
				old.fromIdx( inst.pickIdx, inst.tileMap.width, inst.tileMap.height );
				inst.context.clearRect( old.x * w, old.y * h, rct.w, rct.h );
				inst.tileMap.setDirtyIdx( inst.pickIdx );
				inst.draw();
				
				if( inst.pickIdx == inst.selectIdx )
				{
					// re-draw selection indicator
					inst.drawSelection();
				}
				
				// stroke rect draws outside of the bounds, 
				// so pull it back in a fe px to fit				
				inst.context.strokeStyle = "rgba(255,186,60,0.8)";
				inst.context.strokeRect(rct.getX() * w +1, rct.getY() * h +1, rct.w -2, rct.h -2);
				
				inst.pickIdx = idx;
				inst.refresh = false;
				inst.statusBar.innerHTML = "<p>Tiles Index: " + idx + "</p>";
			}
		}
	}
	
	this.onMouseOut = function( inst )
	{
		return function( e )
		{
			var w = inst.tileMap.gfx.tileW * inst.viewPort.scale;
			var h = inst.tileMap.gfx.tileH * inst.viewPort.scale;
			
			var old = new Point2D();
			old.fromIdx( inst.pickIdx, inst.tileMap.width, inst.tileMap.height );
			inst.context.clearRect( old.x * w, old.y * h, w, h );
			inst.tileMap.setDirtyIdx( inst.pickIdx );
			inst.draw();
			
			if( inst.pickIdx == inst.selectIdx )
			{
				// re-draw selection indicator
				inst.drawSelection();
			}
			
			// make sure we re-draw the pick indicator properly
			inst.refresh = true; 
		}
	}
	
	this.onMouseUp = function( inst )
	{
		return function( e )
		{
			var w = inst.tileMap.gfx.tileW * inst.viewPort.scale;
			var h = inst.tileMap.gfx.tileH * inst.viewPort.scale;
			
			var old = new Point2D();
			old.fromIdx( inst.selectIdx, inst.tileMap.width, inst.tileMap.height );
			inst.context.clearRect( old.x * w, old.y * h, w, h );
			inst.tileMap.setDirtyIdx( inst.selectIdx );
				
			inst.selectIdx = inst.pickIdx;
			inst.tileValue = inst.mapData[0][inst.selectIdx];
			inst.tileMap.setDirtyIdx( inst.selectIdx );
			inst.draw();
			
			inst.drawSelection();
			if( inst.selectIdxNotify )
			{
				inst.selectIdxNotify( inst.selectIdx );
			}
		}
	}
	
	this.drawSelection = function()
	{
		var w = this.tileMap.gfx.tileW * this.viewPort.scale;
		var h = this.tileMap.gfx.tileH * this.viewPort.scale;
		var pnt = new Point2D();
		
		this.context.strokeStyle = "rgb(247,132,0)";
		pnt.fromIdx( this.pickIdx, this.tileMap.width, this.tileMap.height );
		this.context.strokeRect( pnt.x * w +1, pnt.y * h +1, w -2, h -2 );
	}
};
