var calculator = calculator || {};

calculator.core = (function() {

var Tokenizer = null;
/* define/convert operators as [nArgs,function] pairs. */
var fns = {
	// just to make function calls and brackets behave synonymously.
	// f(b) and (b) have the same form, you just need to think of
	// (b) as I(b) where I is the identity function
	"id":[1, function(a) { return a; }],
	// the unary + and -
	"u+":[1, function(a) { return a; }],
	"u-":[1, function(a) { return -a; }],
	// standard operators
	"+": [2, function(a,b) { return a+b; }],
	"-": [2, function(a,b) { return a-b; }],
	"*": [2, function(a,b) { return a*b; }],
	"/": [2, function(a,b) { return a/b; }],
	"^": [2, function(a,b) { return Math.pow(a,b); }],
	"!": [1, function(a)   { if(Math.round(a) != a) throw "Bad parameter to factorial"; if(a < 2) return 1; return a*fns["!"][1](a-1); }],
	"ln":[1, Math.log]
};
"sin cos tan asin acos atan exp log10".split(" ").forEach(function(val) {
	fns[val] = [1, Math[val]];
});

/*
	1. Pass to tokenizer
	2. while more tokens exist:
		if token is a number:
			push on eval_stack
		elseif token is an operator:
			compare this token with operator_stack.top():
				if stack's top has a higher priority:
					eval_the_stack( operator_stack.top() )
					push token just read on operator_stack
				else
					push token just read on operator_stack
		elseif token is a function:
			push the following '(' token on operator_stack
			along with that token, attach the function name
		else if token is '(':
			push it on operator_stack.
			along with it, attach the name of the identity function
		else if token is ')':
			pop the operator_stack -> must result in '('
			pop the required number of numbers from the eval_stack
			eval_the_stack( fn-attached-with-'('-token )
		else if the token is '!':
			eval_the_stack( '!' )
	3. return the value on the eval_stack

*/
function evaluate_expression(expr) {
	var operator_stack = [],
		eval_stack = [];

	function eval_the_stack(fn) {
		var nArgs = fns[fn][0],
			fn = fns[fn][1];

		var args = eval_stack.splice( -nArgs);
		args.map(parseFloat);

		var res = fn.apply(this, args);
		eval_stack.push(res);
	}
	
	try {
		var tokenizer = Tokenizer.init("(" + expr + ")");
		var tk;
		var last_tk;
		while(tokenizer.hasMoreTokens()) {
			last_tk = tk;
			tk = tokenizer.nextToken();
			switch(tk.type) {
				case 'number':
					eval_stack.push(tk.value);
					break;
				
				case 'operator':
					// check for unary + and -
					// + or - is unary if it follows a binary operator, or a bracket opening
					if((tk.value == '+' || tk.value == '-') && last_tk) {
						if(last_tk.type == 'operator' || last_tk.value == "(") {
							if(tk.value == '+')		// unary + sign is useless
													// NOTE: this allows for expressions like +++2 to evaluate to 2
								if(tokenizer.hasMoreTokens()) {
									var t = tokenizer.nextToken();
									if(t.type != 'operator' && t.value != '!') {
										tokenizer.putback();
										continue;
									}
									else 
										throw Error("Too many unary operators")
								}
								else 
									throw Error("Dangling plus sign.");

							// unary minus is just multiplication by -1
							eval_stack.push(-1);
							operator_stack.push({
								type: 'operator',
								value: '*',
								priority: 2			// hardcoded.
							});
							continue;
						}
					}
					var top = operator_stack.slice(-1)[0];
					if(operator_stack.length && top.type != 'parenthesis' && top.priority > tk.priority) {
						eval_the_stack( operator_stack.pop().value );
					}
					operator_stack.push(tk);
					break;
				
				case 'function':
					var fn_name = tk.value;
					tk = tokenizer.nextToken();
					if(tk.value != '(') {
						throw "Syntax Error!";
					}
					tk._fn_ = fn_name;
					operator_stack.push(tk);
					break;
				
				case 'parenthesis':
					if(tk.value == "(") {
						tk._fn_ = "id";
						operator_stack.push(tk);
					}
					else {
						var top = operator_stack.pop();
						while(top.value != '(') {
							eval_the_stack(top.value);
							top = operator_stack.pop();
							//throw "Syntax Error!";
						}
						eval_the_stack( top._fn_ );
					}
					break;

				case 'back_operator':
					eval_the_stack( tk.value );
					break;
			}
		}

		if(eval_stack.length != 1)
			throw "Error. Eval Stack not of size 1."

		if(isNaN(eval_stack[0]))
			throw "Error!";
		
		return eval_stack[0] || 0;
	}
	catch(e) {
		console.log(e);
		return "Error!";
	}
}

var init = function(tk) { Tokenizer = tk; return this; }

	// Public interface of calculator.core
return {
	init: init,
	evaluate_expression: evaluate_expression
}

})();