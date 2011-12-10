
function resize()
{ 
	var windowheight = window.innerHeight;
	var frame = document.getElementById( "container" ); 
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
		try 
		{			
			menuRoot = document.getElementById( menu );
			formRoot = document.getElementById( form );
			if( menuRoot && formRoot )
			{
				menuRoot.style.visibility = 'visible';
				menuRoot.style.display = 'block';
				
				formRoot.elements['create'].onclick = function( e ) {
					menuRoot.style.visibility = 'hidden';
					menuRoot.style.display = 'none';
					menuOpen = false;
				};
			}
		}
		catch( err ) 
		{
			menuOpen = false;
		}
	}
}

