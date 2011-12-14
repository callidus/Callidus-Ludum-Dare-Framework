/*
 * <!--
(c) 2011 Tim Kelsey
distributedunder the terms of the MIT licence 
please see licence.txt
-->
 */


var canvas = null;
var context = null;
var fps = 30;
var map = null;
var viewPort;
var sprites = new Array();
var particles = new Array();

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
	
	pm = new ParticleEngine( 100 );
	pm.initB( new Rect2D( 3, 3, 1, 1 ), 255, 10, 10, 32 );
}

function update()
{	
	var idx;
	viewPort.renderMap( map );
	
	for( var i=0; i<sprites.length; ++i )
	{
		if( viewPort.isVisible( sprites[i].rect ) )
		{
			viewPort.renderSprite( sprites[i], map );
		}
		
		if( !sprites[i].isMoving() )
		{
			idx = sprites[i].rect.point.asIdx( map.width, map.height );
			for( var j=0; j<sfxData.length; ++j )
			{
				if( sfxData[j].idx == idx )
				{
					sfxData[j].trigger( sprites[i] );
				}
			}
		}
	}

	for( var i=0; i<particles.length; ++i )
	{
		if( viewPort.isVisible( particles[i].rect ) )
		{
			viewPort.renderParticles( particles[i], map );
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




