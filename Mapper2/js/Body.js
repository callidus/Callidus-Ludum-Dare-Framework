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

var gTileData = null;
function loadTileDefault( select )
{
	var idx = parseInt( select.selectedIndex );
	if( !isNaN( idx ) )
	{
		gTileData = gDefaultTiles[idx];
		
		var thumb = document.getElementById("tile_thumbnail");
		thumb.src = gTileData.thumb;
		
		var detail = document.getElementById("tile_details");
		detail.innerHTML = gTileData.details;
	}
	else
	{
		gTileData = null;
	}
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
					else if( gTileData )
					{
						close();
						doLoadTileSheet( gTileData.w, gTileData.h, true, gTileData.image ); 
					}
					else
					{
						showInfo("info_menu", "info_form", 
							"Sorry, Invalid Input: width=" + formRoot.elements["width"].value + 
							" and height=" + formRoot.elements["height"].value );
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
	gMapper = new TileMapper();
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
			var newMap = new TileMapper();
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
			gMapper = new TileMapper();
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

function toggleMultiSelect()
{
	// HACK: directly setting multi_select icon is a hack :-(
	// we are doing it to indicate mode toggle.
	
	if( !gMapper.multiSelectMode )
	{
		gMenuTab[ "multi_select" ].iconDisSrc = "img/select-dis.png";
		gMenuTab[ "multi_select" ].iconSrc = "img/select.png";
		gMenuTab[ "multi_select" ].enable( "toggleMultiSelect()" );
		gMapper.statusBar.innerHTML = "<p>Multi Select Mode</p>";
		
		gMenuTab[ "copy" ].enable( "gMapper.copyMultiSelection()" );
		gMenuTab[ "fill" ].enable( "gMapper.fillMultiSelection()" );
		//gMenuTab[ "detail_fill" ].enable( null );
		gMenuTab[ "erase_fill" ].enable( "gMapper.eraseMultiSelection()" );
		gMapper.multiSelectMode = true;
	}
	else
	{
		gMenuTab[ "multi_select" ].iconDisSrc = "img/pointer-dis.png";
		gMenuTab[ "multi_select" ].iconSrc = "img/pointer.png";
		gMenuTab[ "multi_select" ].enable( "toggleMultiSelect()" );
		gMapper.statusBar.innerHTML = "<p>Single Select Mode</p>";
		
		gMenuTab[ "copy" ].disable();
		gMenuTab[ "paste" ].disable();
		gMenuTab[ "fill" ].disable();
		//gMenuTab[ "detail_fill" ].disable();
		gMenuTab[ "erase_fill" ].disable();
		gMapper.multiSelectMode = false;
		gMapper.clearMultiSelection();
	}
}

