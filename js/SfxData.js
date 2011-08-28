//----------------------------------------------------------------------
// hack time now :-(
// need to some how make a game out of this lot ....
//----------------------------------------------------------------------


// sfx values
PLAYER_START = 34;
TELEYPORT_A = 31;
TELEYPORT_B = 32;
TELEYPORT_C = 33;
DEADLY_DEADLY_TRAP = 35;
KEY = 5;
LOCK = 7;
SPRT_X = 36
SPRT_Y = 37
WIN = 38;

//----------------------------------------------------------------------
// player start
//----------------------------------------------------------------------
function playerStart( idx )
{
	this.idx = idx
	this.value = PLAYER_START;
	
	this.init = function()
	{
	}
	
	this.update = function()
	{
	}
	
	this.commit = function()
	{
	}
	
	this.trigger = function( sprite )
	{	
	}
}

//----------------------------------------------------------------------
// telyport
//----------------------------------------------------------------------
function telyport( idx, val )
{
	this.value = val;
	this.idx = idx
	this.locked = 0;
	this.test = 0;
	
	this.init = function()
	{
	}
	
	this.lock = function()
	{
		//this.locked = 1;
		//this.test = 1;
	}
	
	this.update = function()
	{
		//this.locked = 0;
	}
	
	this.commit = function()
	{
		//if( this.test && !this.locked )
		//{
		//	this.test = 0;
		//}
	}
	
	this.trigger = function( sprite )
	{
		//if( this.test )
		//{
		//	this.locked = 1;
		//}
		
		if( this.locked )
		{
			return;
		}
		
		// find a match
		var match = new Array();
		for( i=0; i<sfxData.length; ++i )
		{
			if( sfxData[i].value == this.value )
			{
				match[match.length] = sfxData[i];
			}
		}
		
		if( match.length > 1 )
		{
			var idx = Math.floor( Math.random() * match.length );
			
			var pnt = new Point2D( 0, 0 );
			pnt.fromIdx( match[idx].idx, map.width, map.height );
			sprite.rect.point.y = pnt.y;
			sprite.rect.point.x = pnt.x;
			
			pnt.x -= 1;
			pnt.y -= 1;
			viewPort.viewAt( pnt, map ); // NOTE: should only be player
			
			// HACK!!! get off the telyporter ---------------
			handleKeyPress( null );
			// ----------------------------------------------
			
			var snd = new Audio("snd/tely.wav");
			snd.play();
		}
	}
}

//----------------------------------------------------------------------
// key
//----------------------------------------------------------------------
function key( idx )
{
	this.value = KEY;
	this.idx = idx
	
	this.update = function()
	{
	}
	
	this.commit = function()
	{
	}
	
	this.trigger = function( sprite )
	{	
	}
}


//----------------------------------------------------------------------
// locked
//----------------------------------------------------------------------
function lock( idx )
{
	this.value = LOCK;
	this.idx = idx
	
	this.update = function()
	{
	}
	
	this.commit = function()
	{
	}
	
	this.trigger = function( sprite )
	{	
	}
}


//----------------------------------------------------------------------
// deadly, dealdy trap!
//----------------------------------------------------------------------
function trap( idx )
{
	this.value = DEADLY_DEADLY_TRAP;
	this.idx = idx
	this.lock = 0;
	
	this.update = function()
	{
	}
	
	this.commit = function()
	{
	}
	
	this.trigger = function( sprite )
	{	
		if( !this.lock )
		{
			elem = document.getElementById('msg');
			if( elem.firstChild )
			{
				elem.firstChild.nodeValue = "YOU HAVE BEEN EATEN BY A GLOOPY MONSTER :-( GAME OVER, HIT REFRESH TO TRY AGAIN";
			}
			window.onkeypress = function(e) { } 
			var snd = new Audio("snd/eat.wav");
			snd.play();
			
			this.lock =1;
		}
	}
}

//----------------------------------------------------------------------
// pure win
//----------------------------------------------------------------------
function win( idx )
{
	this.value = WIN;
	this.idx = idx
	this.lock = 0;
	
	this.update = function()
	{
	}
	
	this.commit = function()
	{
	}
	
	this.trigger = function( sprite )
	{	
		if( !this.lock )
		{
			elem = document.getElementById('msg');
			if( elem.firstChild )
			{
				elem.firstChild.nodeValue = "YOU HAVE ESCAPED! WELL DONE! HIT REFRESH TO PLAY AGAIN";
			}
			window.onkeypress = function(e) { } 
			var snd = new Audio("snd/win.wav");
			snd.play();
			
			this.lock = 1;
		}
	}
}


//----------------------------------------------------------------------
// tis a sprt
//----------------------------------------------------------------------
function sprt( idx, val, gfx )
{
	this.oldGfx = map.tileData[LVL_GFX][idx];
	
	this.idx = idx;
	this.gfx = gfx;
	this.delta = 0;
	this.dir = null;
	this.value = val;
	if( val == SPRT_X )
	{
		this.dir = new Point2D( 1, 0 );
	}
	else
	{
		this.dir = new Point2D( 0, 1 );
	}
	
	
	this.update = function()
	{
		this.delta += 1;
		if( this.delta == 100 )
		{
			this.delta = 0 ;
			
			var tX = Math.floor( this.idx % map.width );
			var tY = Math.floor( this.idx / map.width );
			var newIdx = ( tY + this.dir.y ) * map.width + tX + this.dir.x;
			
			if( map.tileData[LVL_PHY][newIdx] != 0 )
			{
				this.dir.y = -this.dir.y;
				this.dir.x = -this.dir.x;
			}
			else
			{
				map.tileData[LVL_GFX][this.idx] = this.oldGfx;
				this.oldGfx = map.tileData[LVL_GFX][newIdx];
				map.tileData[LVL_GFX][newIdx] = this.gfx;
				map.setDirty( this.idx );
				map.setDirty( newIdx );
				this.idx = newIdx;
			}
		}
	}
	
	this.commit = function()
	{
	}
	
	this.trigger = function( sprite )
	{
		if( !this.lock )
		{
			elem = document.getElementById('msg');
			if( elem.firstChild )
			{
				elem.firstChild.nodeValue = "YOU HAVE BEEN EATEN BY A GLOOPY MONSTER :-( GAME OVER, HIT REFRESH TO TRY AGAIN";
			}
			window.onkeypress = function(e) { } 
			var snd = new Audio("snd/eat.wav");
			snd.play();
			
			this.lock = 1;
		}
	}
}


//----------------------------------------------------------------------
// setup
//----------------------------------------------------------------------
sfxData = new Array();
function buildSfxData()
{
	var idx = 0;
	
	// find player starts
	idx = 0;
	idx = map.findSfx( idx, PLAYER_START )
	while( idx != null )
	{
		sfxData[sfxData.length] = new playerStart( idx );
		idx = map.findSfx( idx + 1, PLAYER_START );
	}
	
	// find telyport As
	idx = 0;
	idx = map.findSfx( idx, TELEYPORT_A )
	while( idx != null )
	{
		sfxData[sfxData.length] = new telyport( idx, TELEYPORT_A );
		idx = map.findSfx( idx + 1, TELEYPORT_A );
	}
	
	// find telyport Bs
	idx = 0;
	idx = map.findSfx( idx, TELEYPORT_B )
	while( idx != null )
	{
		sfxData[sfxData.length] = new telyport( idx, TELEYPORT_B );
		idx = map.findSfx( idx + 1, TELEYPORT_B );
	}
	
	// find telyport Cs
	idx = 0;
	idx = map.findSfx( idx, TELEYPORT_C )
	while( idx != null )
	{
		sfxData[sfxData.length] = new telyport( idx, TELEYPORT_C );
		idx = map.findSfx( idx + 1, TELEYPORT_C );
	}
	
	// find deadly deadly traps
	idx = 0;
	idx = map.findSfx( idx, DEADLY_DEADLY_TRAP )
	while( idx != null )
	{
		sfxData[sfxData.length] = new trap( idx );
		idx = map.findSfx( idx + 1, DEADLY_DEADLY_TRAP );
	}
	
	// find keys
	idx = 0;
	idx = map.findSfx( idx, KEY )
	while( idx != null )
	{
		sfxData[sfxData.length] = new key( idx, KEY );
		idx = map.findSfx( idx + 1, LOCK );
	}
	
	// find locks
	idx = 0;
	idx = map.findSfx( idx, LOCK )
	while( idx != null )
	{
		sfxData[sfxData.length] = new lock( idx, LOCK );
		idx = map.findSfx( idx + 1, LOCK );
	}
	
	// find win
	idx = 0;
	idx = map.findSfx( idx, WIN )
	while( idx != null )
	{
		sfxData[sfxData.length] = new win( idx, WIN );
		idx = map.findSfx( idx + 1, WIN );
	}
	
	// find sprt
	idx = 0;
	idx = map.findSfx( idx, SPRT_X )
	while( idx != null )
	{
		sfxData[sfxData.length] = new sprt( idx, SPRT_X, 7 );
		idx = map.findSfx( idx + 1, SPRT_X );
	}
	
	// find sprt
	idx = 0;
	idx = map.findSfx( idx, SPRT_Y )
	while( idx != null )
	{
		sfxData[sfxData.length] = new sprt( idx, SPRT_Y, 7 );
		idx = map.findSfx( idx + 1, SPRT_Y );
	}
}

