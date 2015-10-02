var Sprite = function(src, spriteWidth, spriteHeight) {
	var that = this;
	this.x = 0;
	this.y = 0;
	
	this.spriteWidth = spriteWidth;
	this.spriteHeight = spriteHeight;
	
	this.imagePending = true;
	this.img = new Image();
	this.img.src = src;
	this.img.addEventListener('load', function() {
		that.imagePending = false;
		
		that.spriteHeight = that.spriteHeight || that.img.height;	// 1D vertical array.
		that.spriteWidth = that.spriteWidth || that.img.width;		// 1D horizontal array.
		that.setFrame(0);
	}, false);
};

// zero-based indexing.
Sprite.prototype.setFrame = function(f) {
	if(this.spriteWidth && this.spriteWidth !== this.img.width)	// check if it's not a 1D vertical array.
		this.x = f * this.spriteWidth;
	if(this.spriteHeight && this.spriteHeight !== this.img.height)	// check if it's not a 1D horizontal array.
		this.y = f * this.spriteHeight;
};

Sprite.prototype.draw = function(ctx) {
	if(this.imagePending) return;
	ctx.drawImage(this.img, this.x, this.y, this.spriteWidth, this.spriteHeight,
				 -this.spriteWidth / 2, -this.spriteHeight / 2, this.spriteWidth, this.spriteHeight);
};

var Ship = function(color, friction, rotational_friction) {
	this.x = 0;
	this.y = 0;
	this.rotation = 0;
	this.thrust = 0;
	this.vx = 0;
	this.vy = 0;
	this.vr = 0;	// rotational velocity - degrees
	this.friction = friction;
	this.rotational_friction = rotational_friction;
	this.width = 100;
	this.height = 100;
	
	this.color = color;
	this.sprite = new Sprite('ship-sprite-' + color + '.png', null, 100);
	this.life = 100;
	
	this.radius = 46;	// idiotic! but, needed for circular collision detection.
	
	this.showFlame = false;
	this._flameLevel = 0;	// 0 or 1; helps in flickering effect.
};

Ship.prototype.update = function() {
	this.rotation += this.vr * Math.PI / 180;
	this.vr *= this.rotational_friction;
	
	var ax = Math.cos(this.rotation) * this.thrust,
		ay = Math.sin(this.rotation) * this.thrust;
	
	this.vx = this.friction * this.vx + ax;
	this.vy = this.friction * this.vy + ay;
	
	this.x += this.vx;
	this.y += this.vy;
	
	/* misc stuff */
	this.showFlame = !!this.thrust;
	this._flameLevel++;
	
	/* frame business */
	if(this.isHit) {
		this.sprite.setFrame( 3 );
		this.isHit = false;
	}
	else if(this.destroyed) {
		this.sprite.setFrame( this.destroyedFramePart % 2 ? this.destroyedFrame : this.destroyedFrame++ );
		this.destroyedFramePart = this.destroyedFramePart ? 0 : 1;
		
		if(this.destroyedFrame == 8)
			this.onDestroyComplete();
	}
	else
		this.sprite.setFrame( this.showFlame ? ( (this._flameLevel++ % 4) ? 2 : 1 ) : 0);
};

Ship.prototype.draw = function(ctx) {
	ctx.save();
	ctx.translate(this.x, this.y);
	ctx.rotate(this.rotation);
	this.sprite.draw(ctx);

	ctx.beginPath();
	ctx.arc(0,0, this.radius, 0, Math.PI*2, false);
	ctx.strokeStyle = "red";
	ctx.stroke();
	ctx.closePath();
	ctx.restore();
};

Ship.prototype.destroy = function(cb) {
	this.destroyed = true;
	this.destroyedFrame = 3;
	this.onDestroyComplete = cb;
	this.destroyedFramePart = 1;
};

Ship.prototype.hit = function() {
	this.isHit = true;
};
