
function parseUrl()
{
	// parse url options
	function getQueryVariable( variable ) 
	{ 
		var query = window.location.search.substring( 1 ); 
		var vars = query.split( "&" ); 
		for( var i=0; i<vars.length; i++ ) 
		{ 
			var pair = vars[i].split( "=" ); 
			if( pair[0] == variable ) 
			{ 
				return unescape( pair[1] ); 
			} 
		} 
	}
	
	var haveTiles = false;
	var urlTileSheet  = getQueryVariable( "tilesheet" );
	var urlTileWidth  = parseInt( getQueryVariable( "tw" ) );
	var urlTileHeight = parseInt( getQueryVariable( "th" ) );
	
	if( urlTileSheet != undefined &&
		!isNaN( urlTileWidth ) &&
		!isNaN( urlTileHeight ) )
	{
		haveTiles = true;
	}
	
	var haveMap      = false;
	var urlMapWidth  = parseInt( getQueryVariable( "mw" ) );
	var urlMapHeight = parseInt( getQueryVariable( "mh" ) );
	if( !isNaN( urlMapWidth ) &&
		!isNaN( urlMapHeight ) )
	{
		haveMap = true;
	}
	
	var haveBanner = false;
	var urlBanner = getQueryVariable( "banner" );
	if( urlBanner != undefined )
	{
		haveBanner = true;
	}
	
	if( haveTiles )
	{
		doLoadTileSheet( urlTileWidth, urlTileHeight, true, urlTileSheet,
			function() // wait for tiles to load callback
			{
				if( haveMap )
				{
					doNewMap( urlMapWidth, urlMapHeight );
					if( haveBanner )
					{
						showInfo( "info_menu", "info_form", urlBanner );
					}
				}
			}
		);
		
		return true;
	}
	return false;
}