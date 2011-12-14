/*
 * <!--
(c) 2011 Tim Kelsey
distributedunder the terms of the MIT licence 
please see licence.txt
-->
 */


function Colour( r, g, b )
{
	this.r = r;
	this.g = g;
	this.b = b;
	
	this.getStr = function( a )
	{
		return 'rgba(' + this.r + ','  + this.g + ','+ this.b + ',' + a + ')' ;
	}
}


function ParticleEngine( max )
{
	this.rect = new Rect2D( 0, 0, 0, 0 );
	
	this.Particle = function()
	{
		this.size = 10;
		this.pos = new Point2D( 0, 0 );
		this.colour = new Colour( 0, 0, 0 );
		this.alive = false;
		this.age = 0;
	}
	
	this.behaviour = null;
	this.living = new Array();
	this.particles = new Array();
	for( i=0; i<max; ++i )
	{
		this.particles.push( new this.Particle() );
	}
		
	this.isActive = function()
	{
		return ( this.living.length > 0 );
	}
	
	this.update = function( ctx, delta, pos )
	{
		this.behaviour( ctx, delta, pos );
	}
	
	
	
	this.initA = function()
	{
		for( i=0; i<this.particles.length; ++i )
		{
			var size = Math.floor( Math.random() * 10 );
			var point = this.particles[i];
			point.size = size
			size = size * 2;
			
			point.pos.x = Math.floor( Math.random() * this.rect.w - size ) + size;
			point.pos.y = Math.floor( Math.random() * this.rect.h - size ) + size;
			point.age =  Math.floor( Math.random() * 64 );
			
			point.r = Math.floor( Math.random() * 256 );
			point.g = Math.floor( Math.random() * 256 );
			point.b = Math.floor( Math.random() * 256 );
			
			this.living[i] = point;
		}
		
		this.behaviour = function( ctx, delta, pos )
		{
			for( i=0; i<this.living.length; ++i )
			{
				var point = this.living[i];
				point.age--;
				
				if( point.age > 0 )
				{
					var a = point.age / 64.0;
					var x = 32 + ( ( 32 - point.pos.x ) * a );
					var y = 32 + ( ( 32 - point.pos.y ) * a );
					
					ctx.beginPath( pos.x + x, pos.y + y );
					ctx.fillStyle = 'rgba(' + point.r + ','  + point.g + ','+ point.b + ',' + a + ')' ;
					ctx.arc( pos.x + x, pos.y + y, point.size, 0, 2 * Math.PI );
					ctx.fill();
				}
				else
				{
					this.living.splice( i, 1 );
					i--;
				}
			}
		}
	}
	
	
	this.initB = function( colour, life )
	{
		this.behaviour = this.behaviourB;
		for( i=0; i<this.particles.length; ++i )
		{
			var w = this.rect.w * 64;
			var h = this.rect.h * 64;
			
			var size = Math.floor( Math.random() * 10 );
			var point = this.particles[i];
			point.size = size
			size = size * 2;
			
			point.pos.x = Math.floor( Math.random() * ( w - size * 2 ) ) + size;
			point.pos.y = Math.floor( Math.random() * ( h - size * 2 ) ) + size;
			
			point.r = colour.r;
			point.g = colour.g;
			point.b = colour.b;
			
			point.age = Math.floor( Math.random() * life );
			
			this.living[i] = point;
		}
		
		this.behaviour = function( ctx, delta, pos )
		{
			for( i=0; i<this.living.length; ++i )
			{
				var point = this.living[i];
				point.age--;
				
				if( point.age > 0 )
				{
					var a = point.age / life;
					var x = 32 + ( ( 32 - point.pos.x ) * ( 1 - a ) );
					var y = 32 + ( ( 32 - point.pos.y ) * ( 1 - a ) );
					
					var r = Math.floor( point.r * a );
					var g = Math.floor( point.g * a );
					var b = Math.floor( point.b * a );
					
					ctx.beginPath( pos.x + x, pos.y + y );
					ctx.fillStyle = 'rgba(' + r + ','  + g + ','+ b + ',' + a + ')' ;
					ctx.arc( pos.x + x, pos.y + y, point.size, 0, 2 * Math.PI );
					ctx.fill();
				}
				else
				{
					this.living.splice( i, 1 );
					i--;
				}
			}
		}
	}
	
}
