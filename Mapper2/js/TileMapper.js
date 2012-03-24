// -- main map object ----------------------------------------------
function TileMapper() 
{
	this.viewPort = null;
	this.tileGraphic = null;
	this.tileMap = null;
	this.w = 0;
	this.h = 0;
	this.mapData = new Array;
	this.layerNames = new Array;
	this.canvas = null;
	this.context = null;
	this.pickIdx = 0;
	this.doPaint = false;
	this.activeLayer = 0;
	this.statusBar = null;
	
	this.doMultiSelect = false;
	this.multiSelectMode = false;
	this.multiSelectRect = new Rect2D( 0, 0, 0, 0 );
	this.multiSelectStart = new Point2D( 0, 0 );
	this.multiSelectEnd = new Point2D( 0, 0 );
	
	this.cacheTileW = 0;
	this.cacheTileH = 0;
	
	this.setZoom = function( zoom )
	{
		this.cacheTileW = this.tileGraphic.tileW * zoom;
		this.cacheTileH = this.tileGraphic.tileH * zoom;
		this.canvas.width  = this.w * this.tileGraphic.tileRealW * zoom;
		this.canvas.height = this.h * this.tileGraphic.tileRealH * zoom;
		this.viewPort.scale = zoom;
		this.tileMap.refresh();
		this.viewPort.clear();
		this.draw();
	}

	this.addLayer = function( name )
	{
		var j = ( this.h * this.w );
		var l = this.mapData.length;
		this.mapData[l] = new Array();
		this.layerNames[l] = name;
		for( var i=0; i<j; ++i )
		{
			this.mapData[l][i] = 0;
		}
	}
	
	this.delLayer = function()
	{
		var j = this.mapData.length-1;
		for( var i=this.activeLayer; i<j; ++i )
		{
			this.mapData[i] = this.mapData[i+1];
			this.layerNames[i] = this.layerNames[i+1];
		}
		this.mapData.length = j;
		this.layerNames.length = j;
		this.setActiveLayer( 0 );
	}
	
	this.setActiveLayer = function( layer )
	{
		this.activeLayer = layer;
		this.tileMap.refresh();
		this.draw();
	}
	
	this.setup = function( w, h, old )
	{
		this.statusBar = document.getElementById( "status_bar" );
		this.canvas = document.getElementById( "map_canvas" );
		
		this.context  = this.canvas.getContext( '2d' );
		this.context.mozImageSmoothingEnabled = false; // fix image smoothing on ff
		
		this.viewPort = new ViewPort( 0, 0, w, h, this.canvas );
		this.w = w;
		this.h = h;
		
		if( old )
		{
			this.viewPort.scale = old.viewPort.scale;
			
			var tH = Math.min( old.h, h );
			var tW = Math.min( old.w, w );
			var tZ = old.mapData.length;
			for( var z=0; z<tZ; ++z )
			{
				this.layerNames[z] = old.layerNames[z];
				this.mapData[z] = new Array();
			}
			
			for( var z=0; z<tZ; ++z )
			{
				for( var y=0; y<h; ++y )
				{
					for( var x=0; x<w; ++x )
					{
						if( y >= tH || x >= tW )
						{
							this.mapData[z][x + y * w] = 0;
						}
						else
						{
							this.mapData[z][x + y * w] = old.mapData[z][x + y * old.w];
						}
					}
				}
			}
		}
		else
		{
			var j = ( h * w );
			this.mapData[0] = new Array();
			this.layerNames[0] = "Base Layer";
			for( i=0; i<j; ++i )
			{
				this.mapData[0][i] = 0;
			}
		}
		
		this.tileGraphic = gTileBrowser.tileGraphic;
		this.cacheTileW = this.tileGraphic.tileW * this.viewPort.scale;
		this.cacheTileH = this.tileGraphic.tileH * this.viewPort.scale;
		
		this.tileMap = new TileMap( this.tileGraphic, w, h );
		this.tileMap.setData( this.mapData );
		
		this.canvas.width		= w * this.tileGraphic.tileRealW * this.viewPort.scale;
		this.canvas.height		= h * this.tileGraphic.tileRealH * this.viewPort.scale;
		this.canvas.onmouseout	= this.onMouseOut( this );
		this.canvas.onmousemove	= this.onMouseMove( this );
		this.canvas.onmousedown	= this.onMouseDown( this );
		this.canvas.onmouseup	= this.onMouseUp( this );
		
		this.tileMap.refresh();
		this.draw();
		
		gMenuTab["resize_map"].enable( "resizeMap('resize_map_menu','resize_map_form')" );
		gMenuTab["save_map"].enable( "showMapData('map_data_menu','map_data_form')" );
		gMenuTab["new_layer"].enable( "makeNewLayer('new_layer_menu','new_layer_form')" );
		gMenuTab["zoom"].enable( null );
		gMenuTab["layer_select"].enable( null );
		gMenuTab["multi_select"].enable( "toggleMultiSelect()" );
	}
	
	this.draw = function()
	{
		this.viewPort.renderMap( this.tileMap, this.activeLayer );
	}
	
	this.drawSelectRect = function( x, y, w, h )
	{
		// stroke rect draws outside of the bounds, 
		// so pull it back in a few px to fit
		this.context.strokeStyle = "rgba(255,186,60,0.8)";
		this.context.strokeRect( x*w+1, y*h+1, w-2, h-2 );
	}
	
	this.singleSelect = function( x, y, w, h )
	{
		var pnt = new Point2D( x, y );
		pnt.toTile( w, h );
		
		var idx = pnt.asIdx( this.tileMap.width, this.tileMap.height );
		var rct = new Rect2D( pnt.x, pnt.y, w, h );
		
		if( idx != this.pickIdx || this.refresh )
		{	
			if( this.doPaint )
			{
				this.mapData[this.activeLayer][idx] = gTileBrowser.tileValue;
				this.tileMap.setDirtyIdx( idx );
			}
			
			var old = new Point2D();
			old.fromIdx( this.pickIdx, this.tileMap.width, this.tileMap.height );
			this.context.clearRect( old.x * w, old.y * h, rct.w, rct.h );
			this.tileMap.setDirtyIdx( this.pickIdx );
			this.draw();
			
			this.drawSelectRect( rct.getX(), rct.getY(), rct.w, rct.h );
			
			this.pickIdx = idx;
			this.refresh = false;
			
			var val = this.mapData[this.activeLayer][idx];
			this.statusBar.innerHTML = "<p>Tile Index: " + idx + " Value: " + val + " (Active Layer)</p>";
		}
	}
	
	this.multiSelect = function( x, y, w, h )
	{
		this.clearMultiSelection(); // re-draw selection tiles
	
		this.multiSelectEnd.set( x, y );
		this.multiSelectEnd.toTile( this.cacheTileW, this.cacheTileH );
		
		var sx = Math.min( this.multiSelectStart.x, this.multiSelectEnd.x );
		var sy = Math.min( this.multiSelectStart.y, this.multiSelectEnd.y );
		var sw = Math.max( this.multiSelectStart.x, this.multiSelectEnd.x ) - sx + 1;
		var sh = Math.max( this.multiSelectStart.y, this.multiSelectEnd.y ) - sy + 1;
		this.multiSelectRect.set( sx, sy, sw, sh );
		
		sx *= this.cacheTileW;
		sy *= this.cacheTileH;
		sw *= this.cacheTileW;
		sh *= this.cacheTileH; 
		
		this.context.strokeStyle = "rgba(255,186,60,0.8)";
		this.context.fillStyle = "rgba(255,186,60,0.3)";
		this.context.strokeRect( sx+2, sy+2, sw-3, sh-3 );
		this.context.fillRect( sx, sy, sw, sh );
		
		this.statusBar.innerHTML = "<p>Select: ? to ? (Active Layer)</p>";
	}
	
	this.clearMultiSelection = function()
	{
		var maxX = this.multiSelectRect.point.x + this.multiSelectRect.w;
		var maxY = this.multiSelectRect.point.y + this.multiSelectRect.h;		
		
		for( var y=this.multiSelectRect.point.y; y<maxY; ++y )
		{
			for( var x=this.multiSelectRect.point.x; x<maxX; ++x )
			{
				var idx = y * this.tileMap.width + x;
				this.tileMap.setDirtyIdx( idx );
			}
		}
		
		this.multiSelectRect.set( 0, 0, 0, 0 );
		this.draw();
	}
	
	this.eraseMultiSelection = function()
	{
		var maxX = this.multiSelectRect.point.x + this.multiSelectRect.w;
		var maxY = this.multiSelectRect.point.y + this.multiSelectRect.h;		
		
		for( var y=this.multiSelectRect.point.y; y<maxY; ++y )
		{
			for( var x=this.multiSelectRect.point.x; x<maxX; ++x )
			{
				var idx = y * this.tileMap.width + x;
				this.mapData[this.activeLayer][idx] = 0;
				this.tileMap.setDirtyIdx( idx );
			}
		}
		
		this.draw();
	}
	
	this.fillMultiSelection = function()
	{
		var maxX = this.multiSelectRect.point.x + this.multiSelectRect.w;
		var maxY = this.multiSelectRect.point.y + this.multiSelectRect.h;		
		
		for( var y=this.multiSelectRect.point.y; y<maxY; ++y )
		{
			for( var x=this.multiSelectRect.point.x; x<maxX; ++x )
			{
				var idx = y * this.tileMap.width + x;
				this.mapData[this.activeLayer][idx] = gTileBrowser.tileValue;
				this.tileMap.setDirtyIdx( idx );
			}
		}
		
		this.draw();
	}
	
	this.onMouseMove = function( inst )
	{
		return function( e )
		{
			var w = inst.cacheTileW;
			var h = inst.cacheTileH;
			
			var x = e.offsetX;
			var y = e.offsetY;
			if( x == undefined )
			{
				x = e.layerX;
				y = e.layerY;
			}
			
			if( inst.multiSelectMode )
			{
				if( inst.doMultiSelect )
				{
					inst.multiSelect( x, y, w, h );
				}
			}
			else
			{
				inst.singleSelect( x, y, w, h );
			}
		}
	}
	
	this.onMouseDown = function( inst )
	{
		return function( e )
		{
			// - try and stop right btn context menu --
			if( e.stopPropagation )
			{
				e.stopPropagation();
			}
			if( e.preventDefault )
			{
				e.preventDefault();
			}
			e.cancelBubble = true;
			// --------------------------------------
			
			// TODO: clean this up a bit ...
			if( inst.multiSelectMode )
			{
				var x = e.offsetX;
				var y = e.offsetY;
				if( x == undefined )
				{
					x = e.layerX;
					y = e.layerY;
				}
				
				inst.doMultiSelect = true;
				inst.clearMultiSelection();
				inst.multiSelectStart.set( x, y );
				inst.multiSelectStart.toTile( inst.cacheTileW, inst.cacheTileH );
				inst.multiSelectEnd.set( inst.multiSelectStart.x,
										 inst.multiSelectStart.y );
			}
			else
			{
				inst.doPaint = true;
				inst.tileMap.setDirtyIdx( inst.pickIdx );
			
				if( e.button == 0 ) // left click
				{
					inst.mapData[inst.activeLayer][inst.pickIdx] = gTileBrowser.tileValue;
				}
				else if( e.button == 2 ) // right click
				{
					inst.mapData[inst.activeLayer][inst.pickIdx] = 0;
				}
				
				inst.draw();
				var pnt = new Point2D();
				var w = inst.cacheTileW;
				var h = inst.cacheTileH;
				
				pnt.fromIdx( inst.pickIdx, inst.tileMap.width, inst.height );
				inst.drawSelectRect( pnt.x, pnt.y, w, h );
			}
			return false;
		}
	}
	
	this.onMouseUp = function( inst )
	{
		return function( e )
		{
			inst.doMultiSelect = false;
			inst.doPaint = false;
		}
	}
	
	this.onMouseOut = function( inst )
	{
		return function( e )
		{
			if( inst.multiSelectMode )
			{
				inst.doMultiSelect = false;
			}
			else
			{
				var w = inst.cacheTileW;
				var h = inst.cacheTileH;
				
				var old = new Point2D();
				old.fromIdx( inst.pickIdx, inst.tileMap.width, inst.tileMap.height );
				inst.context.clearRect( old.x * w, old.y * h, w, h );
				inst.tileMap.setDirtyIdx( inst.pickIdx );
				inst.draw();
				
				inst.doPaint = false;
				inst.refresh = true;
			}
		}
	}
}