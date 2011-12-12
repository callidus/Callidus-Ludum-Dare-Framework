
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

var gMenuTab = null;
function nullFunc(){}
function initMenu( id, btn )
{
	lastBtn = document.getElementById( btn );
	lastBtn.setAttribute( "class", "menu_item selected" );
	
	lastMenu = id;
	obj = document.getElementById( id );
	toggleObjVisible( obj );
	
	// grab all our menu items so we can mess with them later
	gMenuTab = {
		'load_tile_sheet' : document.getElementById('load_tile_sheet'),
		'new_map':  document.getElementById('new_map'),
		'open_map' : document.getElementById('open_map'),
		'resize_map' : document.getElementById('resize_map'),
		'save_map' : document.getElementById('save_map'),
		'save_map_as' : document.getElementById('save_map_as'),
		'new_layer' : document.getElementById('new_layer'),
		'show_hide' : document.getElementById('show_hide'),
		'save_layer' : document.getElementById('save_layer'),
		'delete_layer' : document.getElementById('delete_layer'),
		'fill' : document.getElementById('fill'),
		'detail_fill' : document.getElementById('detail_fill') };
	
	// setup all menu items
	for( var key in gMenuTab )
	{	
		if( gMenuTab[key] && gMenuTab.hasOwnProperty( key ) ) 
		{
			var item = gMenuTab[key];
			item.icon = document.getElementById( key + "_img" );
			item.onclick = function( e ){};
			
			item.enable = function( func )
			{
				this.setAttribute( "class", "button" );
				if( func )
				{
					this.setAttribute( "onClick", func );
				}
			}
			
			item.disable = function()
			{
				this.setAttribute( "class", "button_disabled" );
				this.setAttribute( "onClick", "nullFunc()" );
			}
			
			item.disable();
		}
	}
	
	// re-enabel the first item
	gMenuTab['load_tile_sheet'].enable( "loadTileSheet('open_menu','open_menu_form')" );
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

	if (isNaN(dragObj.elStartLeft)) dragObj.elStartLeft = dragObj.elNode.offsetLeft;
	if (isNaN(dragObj.elStartTop))  dragObj.elStartTop  = dragObj.elNode.offsetTop;

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

