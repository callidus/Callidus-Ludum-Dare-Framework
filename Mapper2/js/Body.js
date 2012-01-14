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
	
	//windowheight = ( windowheight / 100 ) * 95;	// 95%
	//frame.style.height = windowheight + "px";
	
	// HACK - fix inner height
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

	this.onLoad = function( inst )
	{
		return function( e )
		{
			var img = e.target.result;
			img.onload = function()
			{
				var gfx = new TileGraphic( img, h, w  );
				gTileBrowser.finaliseLoad( gfx );
			}
		}
	};
	
	this.finaliseLoad = function( gfx )
	{
		this.statusBar = document.getElementById( "status_bar" );
		this.tileMenu = document.getElementById( "tile_menu" );
		this.canvas = document.getElementById( "tile_canvas" );
		this.context  = this.canvas.getContext( '2d' );
		
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
		
		this.viewPort = new ViewPort( 0, 0, 3, j, this.context );
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
			
			var pnt = new Point2D( e.offsetX, e.offsetY );
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
			var w = inst.tileMap.gfx.tileW;
			var h = inst.tileMap.gfx.tileH;
			
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
			var w = inst.tileMap.gfx.tileW;
			var h = inst.tileMap.gfx.tileH;
			
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
		var w = this.tileMap.gfx.tileW;
		var h = this.tileMap.gfx.tileH;
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
				
				// cancel - do nothing 
				formRoot.elements['cancel'].onclick = function( e ) 
				{
					menuRoot.style.visibility = 'hidden';
					menuRoot.style.display = 'none';
					gMenuOpen = false;
				};
				
				close = function( w, h, url )
				{
					gTileBrowser = new TileBrowser();
					gTileBrowser.w = w;
					gTileBrowser.h = h;
					if( url )
					{
						var img = new Image();
						img.onload = function()
						{
							var gfx = new TileGraphic( img, h, w  );
							gTileBrowser.finaliseLoad( gfx );
						}
						img.src = url;
					}
					menuRoot.style.visibility = 'hidden';
					menuRoot.style.display = 'none';
					gMenuOpen = false;
				}
				
				// load file sheet
				formRoot.elements['load'].onclick = function( e ) 
				{
					// load stuff
					var w = parseInt( formRoot.elements["width"].value );
					var h = parseInt( formRoot.elements["height"].value );
					
					if( !isNaN( w ) && !isNaN( h ) )
					{
						close( w, h );
						var file = formRoot.elements["path"].files[0];
						var imageType = /image.*/;  
						if( file.type.match( imageType ) ) 
						{  
							var reader = new FileReader();  
							reader.onloadend = gTileBrowser.onLoad( gTileBrowser );
							reader.readAsDataURL( file ); 
						}
					}
					else
					{
						var select = formRoot.elements['defaults'];
						switch( select.options[select.selectedIndex].value )
						{
							case "default_tiles_1":
								close( 39, 1, "img/default_tiles_1.png" );
								break;
								
							case "default_tiles_2":
								close( 6, 6, "img/default_tiles_2.png" );
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


// -- main map object ----------------------------------------------
function Mapper() 
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
	this.doPaint = false;
	this.activeLayer = 0;
	this.statusBar = null;

	this.addLayer = function()
	{
		var j = ( this.h * this.w );
		var l = this.mapData.length;
		this.mapData[l] = new Array();
		for( var i=0; i<j; ++i )
		{
			this.mapData[l][i] = 0;
		}
	}
	
	this.setActiveLayer = function( layer )
	{
		this.activeLayer = layer;
		this.tileMap.refresh();
	}
	
	this.setup = function( w, h, old )
	{
		this.statusBar = document.getElementById( "status_bar" );
		this.canvas = document.getElementById( "map_canvas" );
		this.context  = this.canvas.getContext( '2d' );
		this.w = w;
		this.h = h;
		
		if( old )
		{
			var tH = Math.min( old.h, h );
			var tW = Math.min( old.w, w );
			var tZ = old.mapData.length;
			for( var z=0; z<tZ; ++z )
			{
				this.mapData[z] = new Array();
			}
			
			for( var z=0; z<tZ; ++z )
			{
				for( var y=0; y<tH; ++y )
				{
					for( var x=0; x<tW; ++x )
					{
						this.mapData[z][x + y * w] = old.mapData[z][x + y * old.w];
					}
				}
			}
		}
		else
		{
			var j = ( h * w );
			this.mapData[0] = new Array();
			for( i=0; i<j; ++i )
			{
				this.mapData[0][i] = 0;
			}

		}
				
		this.tileGraphic = gTileBrowser.tileGraphic;
		this.tileMap = new TileMap( this.tileGraphic, w, h );
		this.tileMap.setData( this.mapData );
		
		this.canvas.width  = w * this.tileGraphic.tileRealW 
		this.canvas.height = h * this.tileGraphic.tileRealH 
		
		this.viewPort = new ViewPort( 0, 0, w, h, this.context );
		this.tileMap.refresh();
		this.draw();
		
		this.canvas.onmouseout		= this.onMouseOut( this );
		this.canvas.onmousemove		= this.onMouseMove( this );
		this.canvas.onmousedown		= this.onMouseDown( this );
		this.canvas.onmouseup		= this.onMouseUp( this );
		
		gMenuTab["resize_map"].enable( "resizeMap('resize_map_menu','resize_map_form')" );
		gMenuTab["save_map"].enable( "showMapData('map_data_menu','map_data_form')" );
		gMenuTab["new_layer"].enable( "makeNewLayer('new_layer_menu','new_layer_form')" );
	}
	
	this.draw = function()
	{
		this.viewPort.renderMap( this.tileMap, this.activeLayer );
	}
	
	this.onMouseMove = function( inst )
	{
		return function( e )
		{
			var w = inst.tileMap.gfx.tileW;
			var h = inst.tileMap.gfx.tileH;
			
			var pnt = new Point2D( e.offsetX, e.offsetY );
			pnt.toTile( w, h );
			
			var idx = pnt.asIdx( inst.tileMap.width, inst.tileMap.height );
			var rct = new Rect2D( pnt.x, pnt.y, w, h );
			
			if( idx != inst.pickIdx || inst.refresh )
			{	
				if( inst.doPaint )
				{
					inst.mapData[inst.activeLayer][idx] = gTileBrowser.tileValue;
					inst.tileMap.setDirtyIdx( idx );
				}
				
				var old = new Point2D();
				old.fromIdx( inst.pickIdx, inst.tileMap.width, inst.tileMap.height );
				inst.context.clearRect( old.x * w, old.y * h, rct.w, rct.h );
				inst.tileMap.setDirtyIdx( inst.pickIdx );
				inst.draw();
				
				// stroke rect draws outside of the bounds, 
				// so pull it back in a fe px to fit				
				inst.context.strokeStyle = "rgba(255,186,60,0.8)";
				inst.context.strokeRect(rct.getX() * w +1, rct.getY() * h +1, rct.w -2, rct.h -2);
				
				inst.pickIdx = idx;
				inst.refresh = false;
				
				var val = inst.mapData[inst.activeLayer][idx];
				inst.statusBar.innerHTML = "<p>Tile Index: " + idx + " Value: " + val + " (Active Layer)</p>";
			}
		}
	}
	
	this.onMouseDown = function( inst )
	{
		return function( e )
		{
			inst.doPaint = true;
			inst.mapData[inst.activeLayer][inst.pickIdx] = gTileBrowser.tileValue;
			inst.tileMap.setDirtyIdx( inst.pickIdx );
			inst.draw();
		}
	}
	
	this.onMouseUp = function( inst )
	{
		return function( e )
		{
			inst.doPaint = false;
		}
	}
	
	this.onMouseOut = function( inst )
	{
		return function( e )
		{
			var w = inst.tileMap.gfx.tileW;
			var h = inst.tileMap.gfx.tileH;
			
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
						
						// load stuff
						gMapper = new Mapper();
						gMapper.setup(	w, h );
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
	
	formRoot.elements['refresh'].onclick = function( e )
	{
		if( gMapper )
		{
			var elem = formRoot.elements['data'];
			elem.innerHTML = "";
			
			elem.innerHTML = gMapper.mapData[gMapper.activeLayer][0];
			for( i=1; i<gMapper.mapData[gMapper.activeLayer].length; ++i )
			{
				elem.innerHTML += "," + gMapper.mapData[gMapper.activeLayer][i];
			}
			elem.innerText = elem.innerHTML;
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
	formRoot.elements['load'].onclick = function( e ) 
	{	
		var w = parseInt( formRoot.elements["width"].value );
		var h = parseInt( formRoot.elements["height"].value );
		var file = formRoot.elements["path"].files[0];
		//var fileType = /text.*/;  
		//if( file.type.match( fileType ) ) 
		
		if( !isNaN( w ) && !isNaN( h ) )
		{  
			var reader = new FileReader();  
			reader.onloadend = function( e )
			{
				if( !gMapper )
				{
					gMapper = new Mapper();
					gMapper.setup( w, h );
				}
				
				var arr = e.target.result.split(',');
				var cnt = Math.min( w * h, arr.length );
				for( var i=0; i<cnt; ++i )
				{
					gMapper.mapData[gMapper.activeLayer][i] = parseInt( arr[i], 10 );
				}
				gMapper.tileMap.setData( gMapper.mapData );
				gMapper.draw();
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
		var elem = formRoot.elements["name"];
		elem.innerHTML = "";
		gMenuOpen = true;
		
		menuRoot.style.visibility = 'visible';
		menuRoot.style.display = 'block';
		
		// ok it
		formRoot.elements['ok'].onclick = function( e ) 
		{
			var sel = document.getElementById( "layers" )
			var len = sel.length;
			
			gMapper.addLayer(); // TODO: need name .... ?
			sel.options[len] = new Option(elem.value + " (" + len + ")", len);
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
	gMapper.setActiveLayer( idx );
	gMapper.viewPort.refresh( gMapper.tileMap );
	gMapper.draw();
}

function layerMapData( menu, form, info )
{
	if( gMapper.activeLayer == LVL_GFX )
	{
		gMapper.setActiveLayer( LVL_PHY )
		showInfo("info_menu", "info_form", "LVL_PHY now active" );
	}
	else if( gMapper.activeLayer == LVL_PHY )
	{
		gMapper.setActiveLayer( LVL_SFX )
		showInfo("info_menu", "info_form", "LVL_SFX now active" );
	}
	else
	{
		gMapper.setActiveLayer( LVL_GFX )
		showInfo("info_menu", "info_form", "LVL_GFX now active" );
	}
}
