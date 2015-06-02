var Bullet = Class.extend({
	init: function(ship, x, y) {
		this.ship = ship;
		this.x = x === undefined ? ship.x : x; //Math.cos(ship.rotation) * (ship.x + ship.width / 2);
		this.y = y === undefined ? ship.y : y; //Math.sin(ship.rotation) * (ship.x + ship.width / 2);
		//this.deltaX = deltaX || 0;
		//this.deltaY = deltaY || 0;
		this.width = 5;
		this.height = 5;
		this.color = ship.color;
		this.rotation = ship.rotation;
		this.speed = 17;
	},
	draw: function(ctx) {
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.rotation);
		ctx.fillStyle = this.color;
		ctx.fillRect(0,0,this.width,this.height);
		ctx.restore();
	},
	move: function(ctx) {
		var vx = Math.cos(this.rotation) * this.speed;
		var vy = Math.sin(this.rotation) * this.speed;
		
		this.x += vx;
		this.y += vy;
		this.draw(ctx);
	}
});

var Laser = Bullet.extend({
	init: function(ship) {
		this._super(ship);
		this.width = 30;
		this.height = 3
		this.speed = 90;
	}
});