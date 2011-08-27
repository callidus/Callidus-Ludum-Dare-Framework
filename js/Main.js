

var canvas = null;
var context = null;
var fps = 30;
var map = null;
var sprites = new Array();

var viewPort;

window.onload = init;
window.onkeypress = function(e) {
  return handleKeyPress(e);
} 

function init()
{
	canvas = document.getElementById( 'main_canvas' );
	context = canvas.getContext( '2d' );
	viewPort = new ViewPort( 1, 1, 6, 6, context );
	
	setInterval( update, 1000/ fps );
	
	var mapGfx = new TileGraphic( "img/map1.png", 1, 39 );
	//mapGfx.setBoarder( 1 );	
	
	map = new TileMap( mapGfx, 50, 50 );
	map.setData( levels[0] );
	map.refresh();
	
	buildSfxData();
							
	buildPlayer( sprites );
}

function update()
{	
	viewPort.renderMap( map );
	for( i=0; i<sprites.length; ++i )
	{
		viewPort.renderSprite( sprites[i], map );
	}
}

// ---------------------------------------------------------------------
// handle a click, relative to the element that was clicked
// ---------------------------------------------------------------------
function handleClickRelative( event, elem )
{
	var tX;
    var tY;
    if( event.pageX != undefined && event.pageY != undefined ) 
    {
		tX = event.pageX;
		tY = event.pageY;
    }
    else
    {
		tX = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		tY = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}
    
    tX -= elem.offsetLeft;
    tY -= elem.offsetTop;
    
    //sprites[ 0 ].setMoveTo( new Point2D( tX, tY ) ); 
}




