/*
 * <!--
(c) 2011 Tim Kelsey
distributedunder the terms of the MIT licence 
please see licence.txt
-->
 */


window.oncontextmenu = function( e )
{
	e = ( e || window.event );
	e.preventDefault();
    e.stopPropagation();
    return false;
}

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
	// HACK reset any state stuff that may persist ---------
	var elem = document.getElementById("map-zoom");
	elem.selectedIndex = 0;
	// -----------------------------------------------------
	
	
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
		'layer_select' : document.getElementById('layer_select'),
		'zoom' : document.getElementById('zoom'),
		'save_layer_as' : document.getElementById('save_layer_as'),
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
			if( item.icon )
			{
				item.iconSrc = item.icon.src;
				item.iconDisSrc = item.icon.src.slice( 0, -4 ) + "-dis.png";
			}
			
			item.onclick = function( e ){};
			
			item.enable = function( func )
			{
				if( this.icon )
				{
					this.icon.src = this.iconSrc;
					this.setAttribute( "class", "button enabled icon" );
				}
				else
				{
					this.setAttribute( "class", "button enabled" );
					if( this.style.background )
					{
						alert( this.style.background );
					}
				}
				
				if( func )
				{
					this.setAttribute( "onClick", func );
				}
			}
			
			item.disable = function()
			{
				if( this.icon )
				{
					this.icon.src = this.iconDisSrc;
				}
				this.setAttribute( "class", "button" );
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

function sizeStart( event, id )
{
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
	
	dragObj.cursorStartX  = event.clientX + window.scrollX;
	dragObj.cursorStartY  = event.clientY + window.scrollY;
	dragObj.elStartHeight = parseInt(dragObj.elNode.style.height, 10);
	dragObj.elStartWidth  = parseInt(dragObj.elNode.style.width, 10);
	
	if (isNaN(dragObj.elStartHeight)) dragObj.elStartHeight = dragObj.elNode.clientHeight;
	if (isNaN(dragObj.elStartWidth)) dragObj.elStartWidth = dragObj.elNode.clientWidth;
	
	// Update element's z-index.
	dragObj.elNode.style.zIndex = ++dragObj.zIndex;
	
	// Capture mousemove and mouseup events on the page.
	document.addEventListener( "mousemove", sizeGo,   true);
	document.addEventListener( "mouseup",   sizeStop, true);
	event.preventDefault();
}

function sizeGo(event)
{
	var x, y;
	
	// Get cursor position with respect to the page.
	x = event.clientX + window.scrollX;
	y = event.clientY + window.scrollY;

	// Move drag element by the same amount the cursor has moved.
	dragObj.elNode.style.height = dragObj.elStartHeight + ( ( y - dragObj.cursorStartY ) ) + "px";
	event.preventDefault();
}

function sizeStop(event) 
{
	// Stop capturing mousemove and mouseup events.
	document.removeEventListener( "mousemove", sizeGo,   true );
	document.removeEventListener( "mouseup",   sizeStop, true );
}

function dragStart( event, id ) 
{
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

	dragObj.cursorStartX = event.clientX + window.scrollX;
	dragObj.cursorStartY = event.clientY + window.scrollY;
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

function stopReturnKey(event)
{
    //alert(event.which);
    if(event.which == 13) event.preventDefault();
	else if(window.event.keyCode == 13) return false;
    else return true;
}
