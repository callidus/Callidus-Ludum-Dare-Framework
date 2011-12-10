
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

// - dragging popups ---------------------------------------------------
var dragObj = new Object();
dragObj.zIndex = 0;

function dragStart( event, id ) 
{
	var el;
	var x, y;

	if (id)
	{
		dragObj.elNode = document.getElementById( id );
	}
	else 
	{
		dragObj.elNode = event.target;

		// If this is a text node, use its parent element.
		if (dragObj.elNode.nodeType == 3)
		{
			dragObj.elNode = dragObj.elNode.parentNode;
		}
	}

	// Get cursor position with respect to the page.
	x = event.clientX + window.scrollX;
	y = event.clientY + window.scrollY;

	dragObj.cursorStartX = x;
	dragObj.cursorStartY = y;
	dragObj.elStartLeft  = parseInt(dragObj.elNode.style.left, 10);
	dragObj.elStartTop   = parseInt(dragObj.elNode.style.top,  10);

	if (isNaN(dragObj.elStartLeft)) dragObj.elStartLeft = 0;
	if (isNaN(dragObj.elStartTop))  dragObj.elStartTop  = 0;

	// Update element's z-index.

	dragObj.elNode.style.zIndex = ++dragObj.zIndex;

	// Capture mousemove and mouseup events on the page.
	document.addEventListener( "mousemove", dragGo,   true);
	document.addEventListener( "mouseup",   dragStop, true);
	event.preventDefault();
}

function dragGo(event) 
{
	var x, y;
	
	// Get cursor position with respect to the page.
	x = event.clientX + window.scrollX;
	y = event.clientY + window.scrollY;

	// Move drag element by the same amount the cursor has moved.
	dragObj.elNode.style.left = (dragObj.elStartLeft + x - dragObj.cursorStartX) + "px";
	dragObj.elNode.style.top  = (dragObj.elStartTop  + y - dragObj.cursorStartY) + "px";
	event.preventDefault();
}

function dragStop(event) 
{
	// Stop capturing mousemove and mouseup events.
	document.removeEventListener( "mousemove", dragGo,   true );
	document.removeEventListener( "mouseup",   dragStop, true );
}
// ---------------------------------------------------------------------

