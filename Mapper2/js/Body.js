/*
 * <!--
(c) 2011 Tim Kelsey
distributedunder the terms of the MIT licence 
please see licence.txt
-->
 */

function resize()
{ 
	var windowheight = window.innerHeight;
	var frame = document.getElementById( "container" ); 

	frame = document.getElementById( "body_main_inner" ); 
	frame.style.height = windowheight - 132 + "px";
}


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


function loadTileDefault( select )
{
	var thumb = document.getElementById("tile_thumbnail");
	var val = select.options[select.selectedIndex].value;
	thumb.src = "img/" + val + "_thumb.png";
}

var gTileBrowser = null;
var gMenuOpen = false;
function loadTileSheet( menu, form )
{
	if( !gMenuOpen )
	{
		gMenuOpen = true;
		try 
		{			
			var menuRoot = document.getElementById( menu );
			var formRoot = document.getElementById( form );
			if( menuRoot && formRoot )
			{
				menuRoot.style.visibility = 'visible';
				menuRoot.style.display = 'block';
				
				var close = function( e )
				{
					menuRoot.style.visibility = 'hidden';
					menuRoot.style.display = 'none';
					gMenuOpen = false;
				}
				
				// cancel - do nothing 
				formRoot.elements['cancel'].onclick = close
				
				// load file sheet
				formRoot.elements['load'].onclick = function( e ) 
				{
					// load stuff
					var w = parseInt( formRoot.elements["width"].value );
					var h = parseInt( formRoot.elements["height"].value );
					var pix = formRoot.elements["units"][0].checked;
					
					if( !isNaN( w ) && !isNaN( h ) )
					{
						var file = formRoot.elements["path"].files[0];
						var imageType = /image.*/;  
						if( file.type.match( imageType ) ) 
						{  
							var reader = new FileReader();  
							reader.onloadend = function( e )
							{
								close();
								doLoadTileSheet( w, h, pix, e.target.result );
							}
							reader.readAsDataURL( file ); 
						}
					}
					else
					{
						var select = formRoot.elements['defaults'];
						switch( select.options[select.selectedIndex].value )
						{
							case "default_tiles_1":
								close();
								doLoadTileSheet( 39, 1, false, "img/default_tiles_1.png" ); 
								break;
								
							case "default_tiles_2":
								close();
								doLoadTileSheet( 6, 6, false, "img/default_tiles_2.png" );
								break;
								
							default:
								showInfo("info_menu", "info_form", 
								"Sorry, Invalid Input: width=" + formRoot.elements["width"].value + 
								" and height=" + formRoot.elements["height"].value );
						}
						return;
					}
				};
			}
		}
		catch( err ) 
		{
			gMenuOpen = false;
		}
	}
}

function doLoadTileSheet( w, h, pix, url, cb )
{
	gTileBrowser = new TileBrowser();
	if( url )
	{
		var img = new Image();
		img.onload = function()
		{
			if( pix ) // size given in pix per tile, convert
			{
				gTileBrowser.w = this.width / w;
				gTileBrowser.h = this.height / h;
			}
			else
			{
				gTileBrowser.w = w;
				gTileBrowser.h = h;
			}
			var gfx = new TileGraphic( this, gTileBrowser.h, gTileBrowser.w  );
			gTileBrowser.finaliseLoad( gfx );
			
			if( cb )
			{
				cb();
			}
		}
		img.src = url;
	}
}


// -- main map object ----------------------------------------------
function Mapper() 
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
	this.multiSelectRect = new Rect2D( 0, 0, 0, 0 );
	
	this.setZoom = function( zoom )
	{
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
		this.draw();
		var point = new Point2D( x, y );
		point.toTile( this.tileGraphic.tileW, this.tileGraphic.tileH );
		point.x++;
		point.y++;
		
		var sIdx = this.multiSelectRect.point.asIdx( this.tileMap.width, this.tileMap.height );
		var eIdx = point.asIdx( this.tileMap.width, this.tileMap.height );
		for( var i=sIdx; i<eIdx; ++i )
		{
			this.tileMap.setDirtyIdx( i );
		}
		
		var nx = this.multiSelectRect.getX() * this.tileGraphic.tileW;
		var ny = this.multiSelectRect.getY() * this.tileGraphic.tileH;
		var nw = Math.max( point.x * this.tileGraphic.tileW - nx, 0 );
		var nh = Math.max( point.y * this.tileGraphic.tileH - ny, 0 ); 
		
		//this.multiSelectRect.w = nw;
		//this.multiSelectRect.h = nh;
		this.draw();
		this.context.strokeStyle = "rgba(255,186,60,0.8)";
		this.context.fillStyle = "rgba(255,186,60,0.3)";
		this.context.strokeRect( nx+2, ny+2, nw-3, nh-3 );
		this.context.fillRect( nx, ny, nw, nh );
		
		this.statusBar.innerHTML = "<p>Select: " + sIdx + " to " + eIdx + " (Active Layer)</p>";
	}
	
	this.onMouseMove = function( inst )
	{
		return function( e )
		{
			var w = inst.tileMap.gfx.tileW * inst.viewPort.scale;
			var h = inst.tileMap.gfx.tileH * inst.viewPort.scale;
			
			var x = e.offsetX;
			var y = e.offsetY;
			if( x == undefined )
			{
				x = e.layerX;
				y = e.layerY;
			}
			
			if( inst.doMultiSelect )
			{
				inst.multiSelect( x, y, w, h );
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
			if( gCtrlDown )
			{
				var x = e.offsetX;
				var y = e.offsetY;
				if( x == undefined )
				{
					x = e.layerX;
					y = e.layerY;
				}
				
				inst.doMultiSelect = true;
				inst.multiSelectRect.set( x, y, 0, 0 );
				inst.multiSelectRect.point.toTile( inst.tileGraphic.tileW, 
												   inst.tileGraphic.tileH );
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
				var w = inst.tileMap.gfx.tileW * inst.viewPort.scale;
				var h = inst.tileMap.gfx.tileH * inst.viewPort.scale;
				
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
			inst.doPaint = false;
			inst.doMultiSelect = false;
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
			
			inst.doMultiSelect = false;
			inst.doPaint = false;
			inst.refresh = true;
		}
	}
}

var gMapper = null;
function newMap( menu, form )
{
	if( !gMenuOpen )
	{
		gMenuOpen = true;
		try 
		{			
			var menuRoot = document.getElementById( menu );
			var formRoot = document.getElementById( form );
			if( menuRoot && formRoot )
			{
				menuRoot.style.visibility = 'visible';
				menuRoot.style.display = 'block';
				
				// cancel - do nothing 
				formRoot.elements['cancel'].onclick = function( e ) 
				{
					menuRoot.style.visibility = 'hidden';
					menuRoot.style.display = 'none';
					gMenuOpen = false;
				};
				
				// build new map
				formRoot.elements['build'].onclick = function( e ) 
				{
					var w = parseInt( formRoot.elements["width"].value );
					var h = parseInt( formRoot.elements["height"].value );
					
					if( !isNaN( w ) && !isNaN( h ) )
					{					
						menuRoot.style.visibility = 'hidden';
						menuRoot.style.display = 'none';
						gMenuOpen = false;
						
						doNewMap( w, h );
					}
					else
					{
						showInfo("info_menu", "info_form", 
							"Sorry, Invalid Input: width=" + formRoot.elements["width"].value + 
							" and height=" + formRoot.elements["height"].value );
						return;
					}
				};
			}
		}
		catch( err ) 
		{
			gMenuOpen = false;
		}
	}
}

function doNewMap( w, h )
{
	gMapper = new Mapper();
	gMapper.setup( w, h );
}

// save map
/*
function saveMap()
{
	function onInitFs()
	{
	}
	
	// alloc a quota
	window.webkitStorageInfo.requestQuota( window.PERSISTENT, 1024*1024, function( grantedBytes ) 
		{ window.requestFileSystem( window.PERSISTENT, grantedBytes, onInitFs, errorHandler ); }, 
		function( e ) { console.log( 'Error', e ); });

	// Note: The file system has been prefixed as of Google Chrome 12:
	window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
	fs = window.requestFileSystem( window.PERSISTENT, size, successCallback, opt_errorCallback );
}
*/

function showMapData( menu, form )
{
	var menuRoot = document.getElementById( menu );
	var formRoot = document.getElementById( form );
	if( menuRoot && formRoot )
	{
		menuRoot.style.visibility = 'visible';
		menuRoot.style.display = 'block';
	}
	
	// close it
	formRoot.elements['close'].onclick = function( e ) 
	{
		menuRoot.style.visibility = 'hidden';
		menuRoot.style.display = 'none';
		gMenuOpen = false;
	};
	
	// refresh data
	formRoot.elements['refresh'].onclick = function( e )
	{
		if( gMapper )
		{
			var prefixSize = false;
			var layerNames = false;
			var allLayers = false;
			
			
			doUpdate = function( idx )
			{
				var max = idx+1;
				var min = idx;
				
				var elem = formRoot.elements['data'];
				elem.innerHTML = "";
				
				if( prefixSize )
				{
					elem.innerHTML += gMapper.w + "," + gMapper.h + ",";
				}
				
				if( allLayers )
				{
					min = 0;
					max = gMapper.layerNames.length;
				}
				
				for( var j=min; j<max; ++j )
				{
					if( layerNames )
					{
						elem.innerHTML += gMapper.layerNames[j] + ",";
					}
					
					elem.innerHTML += gMapper.mapData[j][0];
					for( i=1; i<gMapper.mapData[j].length; ++i )
					{
						elem.innerHTML += "," + gMapper.mapData[j][i];
					}
					elem.innerHTML += ","
				}
				elem.innerHTML = elem.innerHTML.slice( 0, elem.innerHTML.length -= 1 );
				elem.innerText = elem.innerHTML;
			}
			
			var list = formRoot.elements['save_layers'];
			list.options.length = 0;
			for( var i=0; i<gMapper.layerNames.length; ++i )
			{
				list.options[list.options.length] = new Option( gMapper.layerNames[i] + " (" + i + ")" );
			}
			
			list.onchange = function( e )
			{
				doUpdate( this.selectedIndex )
			}
			
			var prefixSizeBtn = formRoot.elements['prefix_size'];
			prefixSize = prefixSizeBtn.checked;
			prefixSizeBtn.onclick = function( e )
			{
				prefixSize = this.checked;
				doUpdate( list.selectedIndex );
			}
			
			var layerNamesBtn = formRoot.elements['layer_names'];
			layerNames = layerNamesBtn.checked;
			layerNamesBtn.onclick = function( e )
			{
				layerNames = this.checked;
				doUpdate( list.selectedIndex );
			}
			
			var allLayersBtn = formRoot.elements['all_layers'];
			list.disabled = allLayers = allLayersBtn.checked;
			allLayersBtn.onclick = function( e )
			{
				list.disabled = allLayers = this.checked;
				doUpdate( list.selectedIndex );
			}
			
			doUpdate( gMapper.activeLayer );
		}
	}
	
	formRoot.elements['refresh'].onclick();
}


function resizeMap( menu, form )
{
	gMenuOpen = true;
	var menuRoot = document.getElementById( menu );
	var formRoot = document.getElementById( form );
	if( menuRoot && formRoot )
	{
		menuRoot.style.visibility = 'visible';
		menuRoot.style.display = 'block';
	}
	
	// close it
	formRoot.elements['cancel'].onclick = function( e ) 
	{
		menuRoot.style.visibility = 'hidden';
		menuRoot.style.display = 'none';
		gMenuOpen = false;
	};
	
	// go
	formRoot.elements['resize'].onclick = function( e )
	{
		var w = parseInt( formRoot.elements["width"].value );
		var h = parseInt( formRoot.elements["height"].value );
		
		if( !isNaN( w ) && !isNaN( h ) )
		{
			var newMap = new Mapper();
			newMap.setup( w, h, gMapper );
			gMapper = newMap;

			menuRoot.style.visibility = 'hidden';
			menuRoot.style.display = 'none';
			gMenuOpen = false;
		}
		else
		{
			showInfo("info_menu", "info_form", 
				"Sorry, Invalid Input: width=" + formRoot.elements["width"].value + 
				" and height=" + formRoot.elements["height"].value );
			return;
		}
	}
}

function loadMap( menu, form )
{
	var menuRoot = document.getElementById( menu );
	var formRoot = document.getElementById( form );
	if( menuRoot && formRoot )
	{
		menuRoot.style.visibility = 'visible';
		menuRoot.style.display = 'block';
	}
	
	// close it
	formRoot.elements['cancel'].onclick = function( e ) 
	{
		menuRoot.style.visibility = 'hidden';
		menuRoot.style.display = 'none';
		gMenuOpen = false;
	};
	
	// load map
	var addLayers = false;
	var layerNames  = false;
	var prefixSize  = false;
	
	var width  = formRoot.elements["width"];
	var height = formRoot.elements["height"];
	var addLayersBtn  = formRoot.elements["add_layers"];
	var layerNamesBtn = formRoot.elements["layer_names"];
	var prefixSizeBtn = formRoot.elements["prefix_size"];
	
	prefixSize = prefixSizeBtn.checked;
	width.disabled = prefixSize;
	height.disabled = prefixSize;
	prefixSizeBtn.onclick = function( e )
	{
		prefixSize = prefixSizeBtn.checked;
		width.disabled = prefixSize;
		height.disabled = prefixSize;
	}
	
	addLayers = addLayersBtn.checked;
	addLayersBtn.onclick = function( e )
	{
		addLayers = addLayersBtn.checked;
	}
	
	layerNames = layerNamesBtn.checked;
	layerNamesBtn.onclick = function( e )
	{
		layerNames = layerNamesBtn.checked;
	}
	
	formRoot.elements['load'].onclick = function( e ) 
	{	
		var w = parseInt( width.value );
		var h = parseInt( height.value );
		var file = formRoot.elements["path"].files[0];
		
		//var fileType = /text.*/;  
		//if( file.type.match( fileType ) ) 
		if( ( !isNaN( w ) && !isNaN( h ) ) || prefixSize )
		{  
			var reader = new FileReader();  
			reader.onloadend = function( e )
			{
				var start = 0;
				var arr = e.target.result.split(',');
				doLoadMapData( arr, prefixSize, addLayers, layerNames )
			}
			reader.readAsText( file );
			menuRoot.style.visibility = 'hidden';
			menuRoot.style.display = 'none';
			gMenuOpen = false;
		}
		else
		{
			showInfo("info_menu", "info_form", 
				"Sorry, Invalid Input: width=" + formRoot.elements["width"].value + 
				" and height=" + formRoot.elements["height"].value );
			return;
		}
	};
}

function doLoadMapData( arr, prefixSize, addLayers, layerNames )
{
	var w = 0;
	var h = 0;
	
	if( prefixSize )
	{
		w = parseInt( arr[0] );
		h = parseInt( arr[1] );
		start = 2;
		
		if( !gMapper )
		{
			gMapper = new Mapper();
			gMapper.setup( w, h );
		}
	}
	else
	{
		w = gMapper.w;
		h = gMapper.h;
	}

	var fst = 0;
	var cnt = w * h;
	var num = Math.floor( ( arr.length - start ) / cnt );

	if( addLayers )
	{
		fst = gMapper.layerNames.length;
	}

	var sel = document.getElementById( "layers" );
	for( var j=fst; j<fst+num; ++j )
	{
		// add layer name
		if( layerNames )
		{
			sel.options[j] = new Option( arr[start] + " (" + j + ")" )
			gMapper.layerNames[j] = arr[start];
			start += 1;
		}
		else
		{
			var name = "Layer (" + j + ")";
			sel.options[j] = new Option( name );
			gMapper.layerNames[j] = name;
		}
		
		// fill it all with 0 first
		gMapper.mapData[j] = new Array();
		for( var i=0; i<( gMapper.w * gMapper.h ); ++i )
		{
			gMapper.mapData[j][i] = 0;
		}
		
		// read in as much data as we have
		var idx1 = 0;
		var idx2 = 0;
		for( var y=0; y<h; ++y )
		{
			for( var x=0; x<w; ++x )
			{
				idx1 = x + y * gMapper.w;
				idx2 = x + y * w;
				
				var val = parseInt( arr[start + idx2], 10 );
				if( isNaN( val ) )
				{
					val = 0;
				}
				gMapper.mapData[j][idx1] = val;
			}
		}
		start += cnt;
	}
	gMapper.tileMap.setData( gMapper.mapData );
	gMapper.setActiveLayer( 0 );
}

function showInfo( menu, form, info )
{
	var menuRoot = document.getElementById( menu );
	var formRoot = document.getElementById( form );
	if( menuRoot && formRoot )
	{
		var elem = formRoot.elements["data"];
		elem.innerHTML = info;
		//elem.innerText = info;
		
		menuRoot.style.visibility = 'visible';
		menuRoot.style.display = 'block';
	}
	
	// close it
	formRoot.elements['close'].onclick = function( e ) 
	{
		menuRoot.style.visibility = 'hidden';
		menuRoot.style.display = 'none';
		gMenuOpen = false;
	};	
}

function makeNewLayer( menu, form )
{
	var menuRoot = document.getElementById( menu );
	var formRoot = document.getElementById( form );
	if( menuRoot && formRoot )
	{
		var elem = formRoot.elements["layer"];
		elem.innerHTML = "";
		gMenuOpen = true;
		
		menuRoot.style.visibility = 'visible';
		menuRoot.style.display = 'block';
		
		// ok it
		formRoot.elements['load'].onclick = function( e ) 
		{
			var sel = document.getElementById( "layers" )
			var len = sel.length;
			var val = elem.value;
			
			gMapper.addLayer( val ); // TODO: need name .... ?
			sel.options[len] = new Option( val + " (" + len + ")", len );
			menuRoot.style.visibility = 'hidden';
			menuRoot.style.display = 'none';
			gMenuOpen = false;
		};
	}
	
	// close it
	formRoot.elements['cancel'].onclick = function( e ) 
	{
		menuRoot.style.visibility = 'hidden';
		menuRoot.style.display = 'none';
		gMenuOpen = false;
	};
}

function setLayer( idx )
{
	if( idx == 0 )
	{
		gMenuTab[ "delete_layer" ].disable();
	}
	else
	{
		gMenuTab[ "delete_layer" ].enable( "deleteLayer()" );
	}
	
	gMapper.setActiveLayer( idx );
}

function deleteLayer()
{
	gMapper.delLayer();
	var layerSelect = document.getElementById( "layers" );
	layerSelect.options.length = 0;
	for( var i=0; i<gMapper.layerNames.length; ++i )
	{
		layerSelect.options[ layerSelect.options.length ] = new Option( gMapper.layerNames[i] + " (" + i + ")" );
	}
}

var zooms = new Array( 4.0, 2.0, 1.0, 0.5, 0.25 );
function setZoom( idx )
{
	if( gMapper )
	{
		gMapper.setZoom( zooms[idx] );
	}
}