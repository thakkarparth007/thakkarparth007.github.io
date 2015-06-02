/**
 * @author:		PARTH THAKKAR
 * @time:		17th April 2012, 7:20 pm
 * 
 * @dependencies
 ***************
 * jQuery.
 * 
 * @description:
 ***************
 * GameAddict.js contains a Game Engine, that was created for assisting the expansion of 
 * 'Galaxy Destruction' game.
 * 
 * @facilities:
 ***************
 * GameAddict engine offers the following features:-
 * 1. Management of the game assets - images, sounds, maps etc.
 * 2. Supporting multiplayer mode.
 * 3. Input handling.
 * 
 * 
 * Input, functions:												*	Context
 * **********************************************************************************************************
 * 1. Current state of any key pressed - true, false; "on", "off"	*	global for keyboard, canvas for mouse
 * 2. Was any given key just pressed - true, false,					*			"		ditto		"
 * 3. Was any given key just released - true, false					*			"		ditto		"
 * 4. Touch events.													*	
 * 5. Dragging.														*
 * 6. Hovering.														*
 */

window.GameAddict = {
	main: function(game) {
		this.game = game;	// call the constructor.
		this.input = new Input( this.game.canvas );
	},
	Game: Class.extend({
		entities: [],
		backgrounds: [],
		
		canvas: { },
		ctx: { },
		
		isGameOver: false,
		onGameOver: function() { },	// what to do when the game finishes.
		
		screen: {
			x: 0,
			y: 0,
			width: 0,
			height: 0
		},
		
		init: function(cvs) {
			this.canvas = cvs;
			this.ctx = cvs.getContext('2d');
			
			var pos = $(cvs).position();
			this.screen.x = pos.left;
			this.screen.y = pos.top;
			this.screen.width = cvs.width;
			this.screen.height = cvs.height;
		},
		start: function() {
			if(!this.isGameOver) window.requestAnimationFrame(this.loop); else this.onGameOver();
		},
		loop: function() {
			this.update();
			this.draw();
		},
		update: function() {
			this.entities.forEach(function(i, elem) {
				elem.update();
			});
		},
		draw: function() {
			this.entities.forEach(function(i, elem) {
				elem.draw();
			});
		}
	}),
	Timer: Class.extend({
		
	}),
	input: Class.extend({
		_keys: {
			/* List taken from jquery.hotkeys plugin. Thanx! changed "return" to "enter" */
			8: "backspace", 9: "tab", 13: "enter", 16: "shift", 17: "ctrl", 18: "alt", 19: "pause",
			20: "capslock", 27: "esc", 32: "space", 33: "pageup", 34: "pagedown", 35: "end", 36: "home",
	87: 'w', 65: 'a',  68: 'd', 70: 'f',  71: 'g',		37: "left", 38: "up", 39: "right", 40: "down", 45: "insert", 46: "del",
			96: "0", 97: "1", 98: "2", 99: "3", 100: "4", 101: "5", 102: "6", 103: "7",
			104: "8", 105: "9", 106: "*", 107: "+", 109: "-", 110: ".", 111 : "/",
			112: "f1", 113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6", 118: "f7", 119: "f8",
			120: "f9", 121: "f10", 122: "f11", 123: "f12", 144: "numlock", 145: "scroll", 188: ",", 190: ".",
			191: "/", 224: "meta"
		},
		_contexts: [],
		
		// this is what _contexts[] contains.
		InputContextObject: Class.extend({
			
		}),
		// recommended that you pass some element. better not use .captureOn(elem) later.
		init: function(elem) {
			this.captureOn(elem || document);	// default.
		},
		// captures on dom-elements.
		captureOn: function(elem) {
			var that = this;
			var $elem = $(elem);
			
			/***************** keyboard input *************/
			
			$(document)	// can't help but bind it to document.
				.keydown(function(e) {
					if(that._keys[e.keyCode]) that.keyboard[ that._keys[e.keyCode] ] = true;
				})
				.keyup(function(e) {
					if(that._keys[e.keyCode]) that.keyboard[ that._keys[e.keyCode] ] = false;
				});
			
			/***************** mouse input *************/

			$elem
				.mousedown(function(e) {
					that.mouse.isPressed = true;
					that.mouse[ (e.button === 0 ? 'left' : 'right') ] = true;
				})
				.mouseup(function(e) {
					that.mouse[ (e.button === 0 ? 'left' : 'right') ] = false;
					that.mouse.isPressed = that.mouse.left || that.mouse.right;
				})
				.mousemove(function(e) {
					var pos = $elem.position();
					that.mouse.x = e.pageX - pos.left;
					that.mouse.y = e.pageY - pos.top;
				});
			
			/***************** touch input *************/
			// to be implemented later.
		},
		keyboard: { },
		mouse: {
			x: 0,
			y: 0,
			left: false,
			right: false,
			isPressed: false
		},
		touch: { }
	})
};
