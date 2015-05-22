function $(expr) {
	var res = document.querySelectorAll(expr);
	if(res.length == 1) return res[0];
	return res;
}

var txt_expr = $("#expression"),
	lbl_res = $("#result");

function evaluate_expression() {
	var expr = txt_expr.value;
	var res = 0;

	function fact(x) {
		if(x != Math.round(x)) throw new Error("Bad parameter");
		if(x < 2) return 1;
		return x * fact(x-1);
	}
	try {
		expr = expr.replace(/([^\d]*)(\d+)\^(\d+)/g, "$1pow($2,$3)");
		expr = expr.replace(/([^\d]*)(\d+)!/g, "$1fact($2)");
		with(Math) {
			res = eval(expr);
			lbl_res.innerHTML = res || 0;
		}
	}
	catch(e) {
		lbl_res.innerHTML = "Syntax Error!";
	}
}

function setCaretPos(pos) {
	pos = pos === undefined ? txt_expr.value.length : pos;

	if(txt_expr.setSelectionRange) {
		txt_expr.focus();
		txt_expr.setSelectionRange( pos, pos );
	}
	else if(txt_expr.createTextRange) {
		var rng = txt_expr.createTextRange();
		rng.collapse(true);
		rng.moveEnd('character', pos);
		rng.moveStart('character', pos);
		rng.select();
	}
}

function getCaretPos() {
	if(document.selection) {
		txt_expr.focus();
		var sel = document.selection.createRange();
		sel.moveStart('character', -txt_expr.value.length);
		return sel.text.length;
	}
	else if(txt_expr.selectionStart || txt_expr.selectionStart == '0') {
		return txt_expr.selectionStart;
	}
	// return the end-position as the caret position by default
	return txt_expr.value.length;
}

function getStyle(elem, prop) {
	if(elem.currentStyle)					// IE way
		return elem.currentStyle[prop];
	else if(window.getComputedStyle)		// W3C way
		return document.defaultView.getComputedStyle(elem, null).getPropertyValue(prop);
}

// cb : callback - called when faded in
function fadeOut(elem, cb) {
	requestAnimationFrame(function() {
		var old_op = parseFloat(getStyle(elem, "opacity"));
		console.log(old_op);

		if(old_op < 0.01) {
			elem.style.opacity = 0;
			typeof cb == "function" && cb();
			return;
		}

		// will take 1/(60*0.01) seconds to fade out at 60FPS
		elem.style.opacity = old_op - 0.1;
		console.log(old_op, elem.style.opacity);

		requestAnimationFrame(arguments.callee, elem);
	}, elem);
}

// cb : callback - called when faded out
function fadeIn(elem, cb) {
	requestAnimationFrame(function() {
		var old_op = parseFloat(getStyle(elem, "opacity"));

		if(old_op > 0.99) {
			elem.style.opacity = 1;
			typeof cb == "function" && cb();
			return;
		}

		// will take 1/(60*0.01) seconds to fade in at 60FPS
		elem.style.opacity = old_op + 0.1;
		requestAnimationFrame(arguments.callee, elem);
	}, elem);
}

function showConstantsPane() {
	// no $("#const_pane").style.opacity = 1
	// because const_pane is "above" scientific pane. (same z-index, but const_pane is defined later)
	// so it doesn't give the fading effect.
	fadeOut( $("#scientific_pane"), function() {
		$("#scientific_pane").classList.add("hidden");
	});
	$("#const_pane").classList.remove("hidden");
	fadeIn( $("#const_pane") );
}

function hideConstantsPane() {
	$("#scientific_pane").style.opacity = 1;
	fadeOut( $("#const_pane"), function() {
		$("#const_pane").classList.add("hidden");
	});
	$("#scientific_pane").classList.remove("hidden");
	fadeIn( $("#scientific_pane") );
}

$("#close_const_pane").addEventListener("click", hideConstantsPane, false);

document.body.addEventListener("keyup", function(e) {
	// handle the enter key separately
	if(e.keyCode == 13) {
		$("#btn_equals").dispatchEvent( new MouseEvent("click") );
		return;
	}

	// to avoid duplicate typing if the txt_expr box is focused
	if(e.target == txt_expr) return;

	switch(e.keyCode) {
		// 0 - 9, "normal" digit keys and numpad keys
		case 48: 	case 96:
		case 49: 	case 97:
		case 50: 	case 98:
		case 51: 	case 99:
		case 52: 	case 100:
		case 53: 	case 101:
		case 54: 	case 102:
		case 55: 	case 103:
		case 56: 	case 104:
		case 57: 	case 105:
			var num = ((e.keyCode - 48) > 9 ? (e.keyCode - 96) : (e.keyCode - 48));
			$("#btn_num" + num).dispatchEvent( new MouseEvent("click") );
			break;

		case 107:

	}
});

var btns = $("button");

for(var b in btns) {
	btns[b].addEventListener("click", function(e) {
		var str = "";
		var caret_pos = getCaretPos();

		// handle the constant-buttons first

		switch(this.id) {
			case "btn_del":
				/*
					21+|5
					   ^	- caret
					caret_pos = 3
					so, txt_expr.value.substr(0,2) + txt_expr.value.substr(caret_pos, tot_len - caret_pos)
				*/
				txt_expr.value = txt_expr.value.substr(0, caret_pos-1)
								+ txt_expr.value.substr(caret_pos, txt_expr.value.length - caret_pos);
				setCaretPos(caret_pos + str.length);
				return;

			case "btn_const":
				showConstantsPane();
				return;

			case "btn_equals":
				evaluate_expression();
				return;

			case "btn_sin":
			case "btn_cos":
			case "btn_tan":
			case "btn_asin":
			case "btn_acos":
			case "btn_atan":
			case "btn_log10":
			case "btn_ln":
				str = this.innerHTML + "(";
				break;

			case "btn_sqrt": 	str = "sqrt("; 	break;
			case "btn_square":	str = "^2";		break;
			case "btn_exp":		str = "exp(";	break;
			case "btn_pow":		str = "^";		break;
			case "btn_div":		str = "/";		break;
			case "btn_mul":		str = "*";		break;
			case "btn_fact":	str = "!";		break;

			/* CONSTANTS! */
			case "btn_constPI":	str = "\u03A0";	break;
			case "btn_constE": 	str = "E";	break;
			case "btn_constg": 	str = "g";	break;
			case "btn_constG": 	str = "G";	break;
			case "btn_constR": 	str = "R";	break;
			case "btn_constK": 	str = "K";	break;
			case "btn_constME": str = "ME"; break;
			case "btn_constRE": str = "RE"; break;
			case "btn_conste": 	str = "e";	break;
			case "btn_constme": str = "me";	break;
			case "btn_constmp": str = "mp";	break;
			case "btn_constmn": str = "mn"; break;
			case "btn_constc": 	str = "c";	break;
			case "btn_consth": 	str = "h";	break;
			case "btn_constepsilon":
								str = "\u03B5₀"; break;
			case "btn_constmu": str = "\u03BC₀"; break;


			default:
				str = this.innerHTML;
		}
		
		txt_expr.value = txt_expr.value.substr(0, caret_pos) + str 
						+ txt_expr.value.substr(caret_pos, txt_expr.value.length - caret_pos);
		setCaretPos(caret_pos + str.length);
		return false;
	}, false);
}