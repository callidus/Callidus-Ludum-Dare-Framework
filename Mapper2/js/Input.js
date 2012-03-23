
var gCtrlDown = false;
function initInput()
{
	window.addEventListener(
		"keydown", 
		function( event ) 
		{
			// Bind to both command (for Mac) and control (for Win/Linux)
			if( event.keyCode == 17 ) 
			{
				gCtrlDown = true;
			}
		}, 
		false );
		
	window.addEventListener(
		"keyup", 
		function( event ) 
		{
			// Bind to both command (for Mac) and control (for Win/Linux)
			if( event.keyCode == 17 ) 
			{
				gCtrlDown = false;
			}
		}, 
		false );
}