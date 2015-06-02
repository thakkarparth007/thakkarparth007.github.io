var utils = {};

utils.captureMouse = function(elem) {
	var mouse = {
		x: 0,
		y: 0,
		isPressed: false,
		button: 0
	};
	elem.addEventListener('mousedown', function(e) {
		mouse.isPressed = true;
		mouse.button = e.button == 0 ? 'left' : 'right';
	}, false);
	elem.addEventListener('mouseup', function(e) {
		mouse.isPressed = false;
		mouse.button = null;
	}, false);
	elem.addEventListener('mousemove', function(e) {
		var x = 0, y = 0;
		if(e.pageX) {
			x = e.pageX;
			y = e.pageY;
		} else {
			x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}
		mouse.x = x - elem.offsetLeft;
		mouse.y = y - elem.offsetTop;
	}, false);
	return mouse;
};
utils.disableRightClick = function(elem) {
	elem.addEventListener('mousedown', function(e) {
		if(e.button == 2) {
			e.preventDefault();
			e.cancelBubble = true;
			return false;
		}
	}, false);
}
if(!window.requestAnimationFrame) {
	window.requestAnimationFrame =  window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.okitRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	function(callback) {
		// 32 Frames per second.
		setInterval(callback, 1000 / 32);
	};
}
utils.toRGB = function(num, alpha) {
	num = Math.floor(num);
	var r = num >> 16,
		g = num >> 8 & 0xFF,
		b = num & 0xFF,
		a = alpha ? ( (alpha < 0) ? 0 : ((alpha > 1) ? 1 : alpha) ) : 1;
	return "rgba("+r+","+g+","+b+","+a+")";
};
utils.containsPoint = function(rect, x, y) {
	return (
		(x > rect.x) && (x < rect.x + rect.width) && 
		(y > rect.y) && (y < rect.y + rect.height)
	);
};
