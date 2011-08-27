
// ---------------------------------------------------------------------
// build a player object
// ---------------------------------------------------------------------
var player = null;
function buildPlayer( sprites )
{
	var snd = new Audio("snd/step.wav");
	snd.volume = 0.1;
			
	var front = new TileAnimationRun();
	front.first = 3;
	front.last = 7;
	front.fps = 8;	
	front.loop = 0;
	front.sound = snd;
	
	var back = new TileAnimationRun();
	back.first = 18;
	back.last = 22;
	back.fps = 8;	
	back.loop = 0;
	back.sound = snd;
	
	var left = new TileAnimationRun();
	left.first = 8;
	left.last = 12;
	left.fps = 8;	
	left.loop = 0;
	left.sound = snd;
	
	var right = new TileAnimationRun();
	right.first = 13;
	right.last = 17;
	right.fps = 8;	
	right.loop = 0;
	right.sound = snd;
	
	var gfx = new TileGraphic( "img/dood-walk.png", 1, 24 );
	//gfx.setBoarder( 1 );	

	player = new TileSprite( gfx );
	player.addAnimRun( front );
	player.addAnimRun( back );
	player.addAnimRun( left );
	player.addAnimRun( right );
	player.setAnimRun( 0 );	
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
		
		var pnt = new Point2D( 0, 0 );
		pnt.fromIdx( starts[strt].idx, map.width, map.height );
		player.setPosition( pnt );
		
		pnt.x -= 1;
		pnt.y -= 1;
		viewPort.viewAt( pnt, map );
	}
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
	
	var targ = new Point2D( 0, 0 );	
	switch( keychar )
	{
		case "w":
			move = 1;
			targ.x = player.rect.getX();
			targ.y = player.rect.getY() - 1;
			player.setAnimRun( 1 );	
			break;
		
		case "a":
			move = 1;
			targ.x = player.rect.getX() - 1;
			targ.y = player.rect.getY();
			player.setAnimRun( 2 );	
			break;
		
		case "s":
			move = 1;
			targ.x = player.rect.getX();
			targ.y = player.rect.getY() + 1;
			player.setAnimRun( 0 );	
			break;
		
		case "d":
			move = 1;
			targ.x = player.rect.getX() + 1;
			targ.y = player.rect.getY();
			player.setAnimRun( 3 );	
			break;
	};
	
	
	if( !viewPort.rect.contains( targ ) )
	{
		move = 0; // cant move outside of vp
	}
	
	if( targ.x == viewPort.rect.getX() )
	{
		viewPort.scrollBy( new Point2D( -1, 0 ) );
	}
	
	if( targ.x == viewPort.rect.getX() + viewPort.rect.w - 1 )
	{
		viewPort.scrollBy( new Point2D( 1, 0 ) );
	}
	
	if( targ.y == viewPort.rect.getY() )
	{
		viewPort.scrollBy( new Point2D( 0, -1 ) );
	}
	
	if( targ.y == viewPort.rect.getY() + viewPort.rect.h - 1 )
	{
		viewPort.scrollBy( new Point2D( 0, 1 ) );
	}
	
	if( move )
	{
		var idx = targ.asIdx( map.width, map.height );
		var tile = map.tileData[LVL_PHY][idx];
		if( this.canPass( tile ) )
		{
			player.setMoveTo( targ );
		}
	}
}

