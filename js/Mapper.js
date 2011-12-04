
window.onload = init;

//init -----------------------------------------------------------------------------
var sideBar = null;
var mainView = null;

function init()
{
	//addColorPickerTarget( document.getElementById( "container" ) );
	
	sideBar = new SideBar();
	sideBar.setup( document.getElementById( 'tile_canvas' ) );
}
//----------------------------------------------------------------------------------


// utils
function toggleObjVisible(obj)
{
// 	obj.style.visibility = ( obj.style.visibility == 'visible' ) ? 'hidden' : 'visible';
	obj.style.display = ( obj.style.display == 'block' ) ? 'none' : 'block';
}

function placeObjAbs(obj, x, y )
{
	obj.style.position = "absolute" ;
	obj.style.left = x + 'px' ;
	obj.style.top  = y + 'px' ;
}

function findObjPos( obj )
{
	var curleft = curtop = 0;
	if (obj.offsetParent) 
	{
		do 
		{
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop;
		} 
		while (obj = obj.offsetParent);
		
		return [curleft,curtop];
	}
}

var lastPopup = null;
function togglePopup( id, btn )
{
	if( lastPopup != id )
	{
		if( lastPopup == null )
		{
			lastPopup = id;
		}
		else
		{
			old = document.getElementById( lastPopup );
			toggleObjVisible( old );
			lastPopup = id;
		}
	}
	else
	{
		lastPopup = null;
	}

	if( id != null )
	{	
		pos = findObjPos( btn );
		obj = document.getElementById( id );
		placeObjAbs( obj, pos[0], pos[1] + btn.height );
		toggleObjVisible( obj );
	}
}	


// ---------------------------------------------------------------------
function loadTileSet( form )
{
	// turn off the popup
	togglePopup( null, null );
	
	// run through the elements we have and find the info we want
	var w = 0;
	var h = 0;
	var reader = new FileReader();  
	var file = null;
	for( i=0; i<form.length; ++i )
	{
		if( form[i].name == "path" )
		{
			file = form[i].files[0];		  
		}
		
		if( form[i].name == "width" )
		{
			w = parseInt( form[i].value );
			continue;
		}
		
		if( form[i].name == "height" )
		{
			h = parseInt( form[i].value );
			continue;
		}
	}
	
	// load stuff
	var imageType = /image.*/;  
	if( file.type.match( imageType ) ) 
	{  
		sideBar.w = w;
		sideBar.h = h;
		//reader.onload = sideBar.onLoad( sideBar ); 
		reader.onloadend = sideBar.onLoad( sideBar ); 
		reader.readAsDataURL( file ); 
	}
}


function newMap( form )
{
	var w = 0;
	var h = 0;
	
	// turn off the popup
	togglePopup( null, null );
	
	// run through the elements we have and find the info we want
	for( i=0; i<form.length; ++i )
	{
		if( form[i].name == "width" )
		{
			w = parseInt( form[i].value );
			continue;
		}
		
		if( form[i].name == "height" )
		{
			h = parseInt( form[i].value );
			continue;
		}
	}
	
	// load stuff
	mainView = new MainView();
	mainView.setup( document.getElementById( 'map_canvas' ),
					sideBar.tileGraphic, w, h );
	sideBar.selectIdxNotify = mainView.onSelectIdx( mainView );
}


