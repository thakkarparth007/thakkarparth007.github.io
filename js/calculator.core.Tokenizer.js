var calculator = calculator || {};
calculator.core = calculator.core || {};
calculator.core.Tokenizer = (function() {

var expr = "";
var ptr = 0;		// pointer that points to the current character in expr

var tokens = [];	// tokenize the whole input at once. Then getting the next token
var token_ptr = 0;	// or putting it back is simply a matter of manipulating token_ptr


var EndOfTokenStreamError = { message: 'No more tokens' };
var InvalidTokenError = { message: 'Invalid character' };

var constants = {
	PI 	: 	Math.PI,
	E 	: 	Math.E,
	g 	: 	9.80665,
	G 	:	6.67428E-11,
	R 	:	6.02214179E+23,
	K 	:	1.3806504E-23,
	ME 	:	5.9736E+24,
	RE 	:	6378140,
	e 	:	2.817940289E-15,
	me 	:	9.10938215E-31,
	mp	:	1.672621637E-27,
	mn 	:	1.6750E-27,
	c 	:	299792458,
	h 	:	6.62606896E-34,
	mu 	:	6.62606896E-34,
	eps :	8.854187817E-12
};

function _nextToken() {
	if(ptr == expr.length)
		throw EndOfTokenStreamError;

	var token = {};
	/*
		Types of token:
			number (constants are automatically converted to their numbers, and the token returned is of type number)
			+ -
			* /
			^
			sqrt, pow, sin, cos, tan, asin, acos, atan, exp, ln, log10, !
			( )
	*/
	var s = expr.substr(ptr);
	try {
		var match = s.match(/^(\d+)?\.?(\d+)/);
		var n = parseFloat( match[0] );
		if(!isNaN(n)) {
			ptr += match[0].length;
			return {
				type: "number",
				priority: 0,
				value: n
			};
		}
	}
	catch(e) { }

	token = {	type: 'operator' };
	switch(s[0]) {
		case '+':
			token.priority = 1;
			token.value = '+';
			ptr += 1;
			return token;

		case '-':
			token.priority = 1;
			token.value = '-';
			ptr += 1;
			return token;

		case '*':
			token.priority = 2;
			token.value = '*';
			ptr += 1;
			return token;
		
		case '/':
			token.priority = 2;
			token.value = '/';
			ptr += 1;
			return token;
		
		case '^':
			token.priority = 3;
			token.value = '^';
			ptr += 1;
			return token;
	}

	var matches = s.match(/^(sqrt|pow|sin|cos|tan|asin|acos|atan|exp|ln|log10)/);
	if(matches && matches.length) {
		ptr += matches[0].length;
		return {
			type: 'function',
			priority: 4,
			value: matches[0]
		};
	}

	matches = s.match(/^(PI|E|g|G|R|K|ME|RE|e|me|mp|mn|c|h|mu|eps)[^a-zA-Z]*/);
	if(matches && matches.length > 1) {
		ptr += matches[1].length;
		return {
			type: 'number',
			priority: 0,
			value: constants[matches[1]]	// simply return the value of the 
		}
	}


	if(s[0] == '!') {
		ptr++;
		return {
			type: 'back_operator',
			priority: 4,
			value: '!'
		};
	}
	
	if(s[0] == '(' || s[0] == ')') {
		ptr++;
		return {
			type: 'parenthesis',
			priority: 5,
			value: s[0]
		};
	}

	throw InvalidTokenError;
}

function init(ex) {
	if(!ex) return this;
	// forget the past. Start afresh
	expr = ex.trim();
	ptr = 0;

	expr = expr.replace("\u03A0", "PI");
	expr = expr.replace("\u03B5₀", "eps");
	expr = expr.replace("\u03BC₀", "mu");

	tokens = [];
	token_ptr = 0;

	while(ptr != expr.length) {
		tokens.push(_nextToken());
	}

	return this;
}

function hasMoreTokens() {
	return token_ptr != tokens.length;
}

function putback() {
	if(token_ptr > 0)
		token_ptr--;
}

function nextToken() {
	return tokens[token_ptr++];
}

return {
	init: init,
	putback: putback,
	nextToken: nextToken,
	hasMoreTokens: hasMoreTokens,
	constants: constants
};

})();