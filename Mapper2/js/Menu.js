
function toggleObjVisible(obj)
{
 	obj.style.visibility = ( obj.style.visibility == 'visible' ) ? 'hidden' : 'visible';
	obj.style.display = ( obj.style.display == 'block' ) ? 'none' : 'block';
}


var lastBtn = null;
var lastMenu = null;
function toggleMenu( id, btn )
{
	if( lastMenu != id )
	{
		btn.setAttribute( "class", "menu_item selected" );
		obj = document.getElementById( id );
		toggleObjVisible( obj );
		
		if( lastMenu == null )
		{
			lastMenu = id;
		}
		else
		{
			if( lastBtn != null )
			{
				lastBtn.setAttribute( "class", "menu_item" );
			}
			
			lastBtn = btn;
			
			old = document.getElementById( lastMenu );
			toggleObjVisible( old );
			lastMenu = id;
		}
	}
}	

function initMenu( id, btn )
{
	lastBtn = document.getElementById( btn );
	lastBtn.setAttribute( "class", "menu_item selected" );
	
	lastMenu = id;
	obj = document.getElementById( id );
	toggleObjVisible( obj );
}
