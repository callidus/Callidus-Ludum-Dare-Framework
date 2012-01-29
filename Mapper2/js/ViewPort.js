/*
 * <!--
(c) 2011 Tim Kelsey
distributedunder the terms of the MIT licence 
please see licence.txt
-->
 */

function ViewPort( x, y, w, h, canvas )
{
	this.forceDirty = true;
	
	this.marginX = false;
	this.marginY = false;
	this.marginW = false;
	this.marginH = false;
	
	this.delta = 33.3;
	this.canvas = canvas
	this.context = this.canvas.getContext( '2d' );
	this.rect = new Rect2D( x, y, w, h );
	this.scale = 1.0;
	
	
	// -----------------------------------------------------------------
	// render a tile map using the viewport
	// -----------------------------------------------------------------
	this.renderMap = function( map, layer )
	{
		var x = this.rect.getX();
		var y = this.rect.getY();
		var tW = Math.min( x + this.rect.w, map.width );
		var tH = Math.min( y + this.rect.h, map.height );
		
		for( j=y; j<tH; ++j )
		{
			for( i=x; i<tW; ++i )
			{
				var idx = j * map.width + i;
				if( map.dirtyFlags[idx] )
				{
					map.dirtyFlags[idx] = 0;
					if( layer != 0 && map.tileData[layer][idx] != 0 )
					{
						map.gfx.draw( this.context, 
							( i - x ) * map.gfx.tileW * this.scale,
							( j - y ) * map.gfx.tileH * this.scale,
							map.tileData[layer][idx], this.scale );
					}
					else
					{					
						map.gfx.draw( this.context, 
							( i - x ) * map.gfx.tileW * this.scale,
							( j - y ) * map.gfx.tileH * this.scale,
							map.tileData[0][idx], this.scale );
					}
				}
			}
		}
	}
	
	this.clear = function()
	{
		this.context.clearRect ( 0 , 0 , this.canvas.width , this.canvas.height );
	}
}

