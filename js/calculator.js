(function() {
	var tokenizer = calculator.core.Tokenizer.init();
	var core = calculator.core.init(tokenizer);
	var ui = calculator.UI.init(core);
	// yes. That's it.
})();