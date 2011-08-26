

var canvas = null;
var context = null;
var fps = 30;
var map = null;
var sprites = new Array();

window.onload = init;
window.onkeypress = function(e) {
  return handleKeyPress(e);
} 

function init()
{
	canvas = document.getElementById( 'main_canvas' );
	context = canvas.getContext( '2d' );
	
	setInterval( update, 1000/ fps );
	
	var mapGfx = new TileGraphic( "img/map1.png", 1, 39 );
	mapGfx.setBoarder( 1 );	
	
	map = new TileMap( mapGfx, 50, 50 );
	map.setData( levels[0] );
							
	map.setViewPort( new Rect2D( 0, 0, 5, 5 ) );
	map.refresh();
	
	buildSfxData();
							
	buildPlayer( sprites );
}

function update()
{	
	for( i=0; i<sprites.length; ++i )
	{
		var render = 0;
		rect = sprites[i].getBounds();
		sprites[i].update( 33.3 ); // aprox

		// - dont like this --------------------------------------------
		if( !sprites[i].isMoving() )
		{
			var rect2 = sprites[i].getBounds();
			idx = map.pointToTileIdxVP( rect2.x, rect2.y );
			for( j=0; j<sfxData.length; ++j )
			{
				if( sfxData[j].idx == idx )
				{
					sfxData[j].trigger( sprites[i] );
				}
			}
		}
		// -------------------------------------------------------------
		
		if( true ) // sprite visibility test
		{			
			if( sprites[i].isDirty() )
			{
				map.setDirtyRectPx( rect );
			}
		}
		else
		{
			sprites[i].clearDirty();
		}
	}
	
	map.draw( context );
	
	for( i=0; i<sprites.length; ++i )	 
	{
		if( sprites[i].isDirty() )
		{
			sprites[i].draw( context );
		}
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




