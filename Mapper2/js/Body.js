
function resize()
{ 
	var windowheight = window.innerHeight;
	var frame = document.getElementById( "container" ); 
<<<<<<< HEAD
	var canvasMain = document.getElementById( "map_canvas" ); 

	windowheight = ( windowheight / 100 ) * 95;	// 95%
	frame.style.height = windowheight + "px"; 
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

	this.onLoad = function( inst )
	{
		return function( e )
		{
			inst.tileMenu = document.getElementById( "tile_menu" );
			inst.canvas = document.getElementById( "tile_canvas" );
			inst.context  = inst.canvas.getContext( '2d' );
			
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
			inst.show();
			inst.draw();
			
			inst.canvas.onmousemove		= inst.onMouseMove( inst );
			inst.canvas.onmouseup		= inst.onMouseUp( inst );
			inst.tileMenu.onmouseout	= inst.onMouseOut( inst );
			
			inst.selectIdx = 0;
			inst.drawSelection();
		}
	};
	
	this.draw = function()
	{
		this.viewPort.renderMap( this.tileMap );
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
			inst.tileValue = inst.mapData[LVL_GFX][inst.selectIdx];
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


var gTileBrowser = null;
var gMenuOpen = false;
function loadTileSheet( menu, form )
{
	if( !gMenuOpen )
	{
		gMenuOpen = true;
		try 
		{			
			menuRoot = document.getElementById( menu );
			formRoot = document.getElementById( form );
			if( menuRoot && formRoot )
			{
				menuRoot.style.visibility = 'visible';
				menuRoot.style.display = 'block';
				
				// cancel - do nothing 
				formRoot.elements['cancel'].onclick = function( e ) {
					menuRoot.style.visibility = 'hidden';
					menuRoot.style.display = 'none';
					gMenuOpen = false;
				};
				
				// load file sheet
				formRoot.elements['load'].onclick = function( e ) {
					menuRoot.style.visibility = 'hidden';
					menuRoot.style.display = 'none';
					gMenuOpen = false;
					
					// load stuff
					gTileBrowser = new TileBrowser();
					gTileBrowser.w = formRoot.elements["width"].value;
					gTileBrowser.h = formRoot.elements["height"].value;
					
					var file = formRoot.elements["path"].files[0];
					var imageType = /image.*/;  
					if( file.type.match( imageType ) ) 
					{  
						var reader = new FileReader();  
						reader.onloadend = gTileBrowser.onLoad( gTileBrowser );
						reader.readAsDataURL( file ); 
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
	
	this.setup = function( w, h )
	{		
		this.canvas = document.getElementById( "map_canvas" );
		this.context  = this.canvas.getContext( '2d' );
		this.w = w;
		this.h = h;
		
		var j = ( h * w );
		this.mapData[LVL_GFX] = new Array();
		this.mapData[LVL_PHY] = null;
		this.mapData[LVL_SFX] = null;
		
		for( i=0; i<j; ++i )
		{
			this.mapData[LVL_GFX][i] = 0;
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
	}
	
	this.draw = function()
	{
		this.viewPort.renderMap( this.tileMap );
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
					inst.mapData[LVL_GFX][idx] = gTileBrowser.tileValue;
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
			}
		}
	}
	
	this.onMouseDown = function( inst )
	{
		return function( e )
		{
			inst.doPaint = true;
			inst.mapData[LVL_GFX][inst.pickIdx] = gTileBrowser.tileValue;
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
=======
	var canvasLeft = document.getElementById( "canvas_left" ); 
	var canvasMain = document.getElementById( "canvas_main" ); 

	// 90%
	windowheight = ( windowheight / 100 ) * 95;	
	frame.style.height = windowheight + "px"; 
	//canvasLeft.style.height = windowheight - 84 + "px";
	canvasMain.style.height = windowheight - 84 + "px";
}

var menuOpen = false;
function loadTileSheet( menu, form )
{
	if( !menuOpen )
	{
		menuOpen = true;
>>>>>>> a1e99dc3f635dddf6556a11c8e0f244a8931f9b6
		try 
		{			
			menuRoot = document.getElementById( menu );
			formRoot = document.getElementById( form );
			if( menuRoot && formRoot )
			{
				menuRoot.style.visibility = 'visible';
				menuRoot.style.display = 'block';
				
<<<<<<< HEAD
				// cancel - do nothing 
				formRoot.elements['cancel'].onclick = function( e ) {
					menuRoot.style.visibility = 'hidden';
					menuRoot.style.display = 'none';
					gMenuOpen = false;
				};
				
				// build new map
				formRoot.elements['build'].onclick = function( e ) {
					menuRoot.style.visibility = 'hidden';
					menuRoot.style.display = 'none';
					gMenuOpen = false;
					
					// load stuff
					gMapper = new Mapper();
					gMapper.setup(	formRoot.elements["width"].value, 
									formRoot.elements["height"].value );
=======
				formRoot.elements['create'].onclick = function( e ) {
					menuRoot.style.visibility = 'hidden';
					menuRoot.style.display = 'none';
					menuOpen = false;
>>>>>>> a1e99dc3f635dddf6556a11c8e0f244a8931f9b6
				};
			}
		}
		catch( err ) 
		{
<<<<<<< HEAD
			gMenuOpen = false;
=======
			menuOpen = false;
>>>>>>> a1e99dc3f635dddf6556a11c8e0f244a8931f9b6
		}
	}
}

<<<<<<< HEAD
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
	menuRoot = document.getElementById( menu );
	formRoot = document.getElementById( form );
	if( menuRoot && formRoot )
	{
		menuRoot.style.visibility = 'visible';
		menuRoot.style.display = 'block';
	}
	
	// close it
	formRoot.elements['close'].onclick = function( e ) {
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
			
			for( i=0; i<gMapper.mapData[LVL_GFX].length; ++i )
			{
				elem.innerHTML += "," + gMapper.mapData[LVL_GFX][i];
			}
			elem.innerText = elem.innerHTML;
		}
	}
	
	formRoot.elements['refresh'].onclick();
}
=======
>>>>>>> a1e99dc3f635dddf6556a11c8e0f244a8931f9b6
