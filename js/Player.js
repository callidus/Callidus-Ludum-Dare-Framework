
// ---------------------------------------------------------------------
// build a player object
// ---------------------------------------------------------------------
var player = null;
function buildPlayer( sprites )
{		
	var front = new TileAnimationRun();
	front.first = 3;
	front.last = 7;
	front.fps = 8;	
	front.loop = 0;
	
	var back = new TileAnimationRun();
	back.first = 18;
	back.last = 22;
	back.fps = 8;	
	back.loop = 0;
	
	var left = new TileAnimationRun();
	left.first = 8;
	left.last = 12;
	left.fps = 8;	
	left.loop = 0;
	
	var right = new TileAnimationRun();
	right.first = 13;
	right.last = 17;
	right.fps = 8;	
	right.loop = 0;
	
	var gfx = new TileGraphic( "img/dood-walk.png", 1, 24 );
	gfx.setBoarder( 1 );	

	player = new TileSprite( gfx, new MovePolicy_snap() );
	player.addRun( front );
	player.addRun( back );
	player.addRun( left );
	player.addRun( right );
	player.setRun( 0 );	
	player.speed = 95;
	
	// ----------------------------------------------------------------
	// HACK: player start
	// ----------------------------------------------------------------
	var starts = new Array();
	for( i=0; i<sfxData.length; ++i )
	{
		if( sfxData[i].value == PLAYER_START )
		{
			starts[starts.length] = sfxData[i];
		}
	}
	
	if( starts.length )
	{
		var strt = Math.floor( Math.random()*starts.length );
		map.scrollToIndex( starts[strt].idx )
	}
	
	player.pos.y = map.tileGfx.tileH;
	player.pos.x = map.tileGfx.tileW;
	// ----------------------------------------------------------------
	
	
	
	sprites[sprites.length] = player
}

// ---------------------------------------------------------------------
// handle a key press
// ---------------------------------------------------------------------
var keychar = null;
function handleKeyPress( event )
{
	this.canPass = function( val )
	{
		return ( val == 0 );
	}
	
	if( player.isMoving() )
	{
		return;
	}
	
	if( event != null )
	{
		var key = window.event ? event.keyCode : event.which;
		keychar = String.fromCharCode(key);
	}
	
	var tA = 0;
	var tB = 0;
	var tW = map.tileGfx.tileW;
	var tH = map.tileGfx.tileH;
	var targ = new Point2D( 0, 0 );
	var move = 0;
	
	switch( keychar )
	{
		case "w":
			tA = player.pos.y - tH;
			if( tA < 0 )
			{
				break;
			}
			
			move = 1;
			if( tA == 0  && map.scrollViewPort( 0, -1 ) )
			{
				player.pos.y += tH;
			}
			targ.x = player.pos.x;
			targ.y = player.pos.y - tH;
			
			player.setRun( 1 );	
			break;
		
		case "a":
			tA = player.pos.x - tW;
			if( tA < 0 )
			{
				break;
			}
			
			move = 1;
			if( tA == 0 && map.scrollViewPort( -1, 0 ) )
			{
				player.pos.x += tW;
			}
			targ.x = player.pos.x - tW;
			targ.y = player.pos.y;
			
			player.setRun( 2 );	
			break;
		
		case "s":
			tA = player.pos.y + tH;
			tB = ( map.viewPort.h - 1 ) * tH;
			if( tA > tB )
			{
				break;
			}
		
			move = 1;
			if( tA == tB && map.scrollViewPort( 0, +1 ) )
			{
				player.pos.y -= tH;
			}
			targ.x = player.pos.x;
			targ.y = player.pos.y + tH;
			
			player.setRun( 0 );	
			break;
		
		case "d":
			tA = player.pos.x + tW;
			tB = ( map.viewPort.w - 1 ) * tW;
			if( tA > tB )
			{
				break;
			}
			
			move = 1;
			if( tA == tB && map.scrollViewPort( 1, 0 ) )
			{
				player.pos.x -= tW;
			}
			targ.x = player.pos.x + tW;
			targ.y = player.pos.y;
			
			player.setRun( 3 );	
			break;
	};
	
	if( move )
	{
		var idx = map.pointToTileIdxVP( targ.x, targ.y );
		var tile = map.tileData[LVL_PHY][idx];
		if( this.canPass( tile ) )
		{
			player.setMoveTo( targ );
		}
	}
}

