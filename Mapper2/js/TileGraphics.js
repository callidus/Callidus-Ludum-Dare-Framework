/*
 * <!--
(c) 2011 Tim Kelsey
distributedunder the terms of the MIT licence 
please see licence.txt
-->
 */


// ---------------------------------------------------------------------
// a tile graphic
// ---------------------------------------------------------------------
function TileGraphic( img, rows, cols )
{
	this.rows = rows;
	this.cols = cols;
	
	this.img = new Image();
	this.img.src = img;
	
	this.tileW = this.img.width / cols;
	this.tileH = this.img.height / rows;
	
	this.tileRealW = this.tileW;
	this.tileRealH = this.tileH;
	this.offset = 0;
	
	// trim off any boarders
	this.setBoarder = function( px )
	{
		this.offset = px;
		this.tileW = this.tileRealW - px * 2; 
		this.tileH = this.tileRealH - px * 2;
	}
	
	// we need to draw stuff
	this.draw = function( ctx, dX, dY, idx )
	{
		var sX = this.tileRealW * Math.floor( idx % this.cols );
		var sY = this.tileRealH * Math.floor( idx / this.cols );
		
		ctx.drawImage(	this.img,
						sX + this.offset, sY + this.offset, 
						this.tileW, this.tileH,
						dX, dY, this.tileW, this.tileH );
	}
}





