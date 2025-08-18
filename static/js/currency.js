(function(){
	function format(value){
		if(!value) return '';
		var digits = value.replace(/\D+/g,'');
		if(digits === '') return '';
		return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
	}
	function onInput(e){
		var caret = e.target.selectionStart;
		var before = e.target.value;
		e.target.value = format(before);
		try { e.target.setSelectionRange(caret, caret); } catch(err){}
	}
	document.addEventListener('input', function(e){
		if(e.target && e.target.classList && e.target.classList.contains('currency-input')){
			onInput(e);
		}
	});
	window.addEventListener('DOMContentLoaded', function(){
		document.querySelectorAll('.currency-input').forEach(function(el){ el.value = format(el.value); });
	});
})();