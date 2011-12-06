
function resize()
{ 
	var windowheight = window.innerHeight;
	var frame = document.getElementById( "container" ); 
	var canvasLeft = document.getElementById( "canvas_left" ); 
	var canvasMain = document.getElementById( "canvas_main" ); 

	// 90%
	windowheight = ( windowheight / 100 ) * 90;	
	frame.style.height = windowheight + "px"; 
	canvasLeft.style.height = windowheight - 84 + "px";
	canvasMain.style.height = windowheight - 84 + "px";
}
