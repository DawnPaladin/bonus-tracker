var $formulaTemplate = $('.formula').clone();
var $rowTemplate = $('#row-template').clone().removeAttr('id');
$('#row-template').hide();

function addRowAfter($currentRow, $template) {
	var $newRow = $template.clone();
	$currentRow.after($newRow);
	$newRow.find('.name').first().focus();
}

function newFormula(index) {
	var $formulas = $('.formula');
	$formulas.eq(index).after($formulaTemplate.clone());
}

function sumBonuses(bonuses) {
	var total = {
		numbers: 0,
		dice: [],
		other: []
	};
	bonuses.forEach(function(bonus) {
		if (!bonus) return;
		if ($.isNumeric(bonus)) {
			total.numbers += Number(bonus);
		} else {
			let regexResult = bonus.toLowerCase().match(/(\d+d\d+)/);
			if (regexResult) {
				total.dice.push(regexResult[0]);
				// TODO: combine dice (1d4 + 1d4 = 2d4)
			} else {
				total.other.push(bonus);
			}
		}
	});
	var outputString = "";
	total.dice.forEach(function(die, index) {
		outputString += " + " + die;
	});
	if (total.numbers) outputString += " + " + total.numbers;
	total.other.forEach(function(item) {
		outputString += " + " + item;
	});
	return outputString.slice(3); // remove leading " + "
}

function updateTotal($table) {
	var bonuses = [];
	$table.find('tr').each(function() {
		var value = $(this).find('.amount').val();
		var checked = $(this).find('.checkbox').prop('checked');
		if (value && checked) bonuses.push(value);
	});
	$table.find('.total').text(sumBonuses(bonuses));
}

(function init() {
	addRowAfter($('#row-template'), $rowTemplate);
	$('body')
		.on('click', '.add-formula', function() {
			var indexInFormulas = $('.formula').index($(this).parent());
			newFormula(indexInFormulas);
		})
		.on('click', '.remove-formula', function() {
			var $thisFormula = $(this).parent();
			var $formulaName = $thisFormula.find('.formula-name').val();
			var warning = $formulaName ? "Really delete the " + $formulaName + " formula?" : "Really delete this formula?";
			if (confirm(warning)) $thisFormula.remove();
		})
		.on('click', '.add-row', function(event) {
			var $thisRow = $(this).parent().parent();
			addRowAfter($thisRow, $rowTemplate);
		})
		.on('click', '.remove-row', function(event) {
			var $thisRow = $(this).parent().parent();
			$thisRow.remove();
			var $table = $(this).closest('table');
			updateTotal($table);
		})
		.on('input', function(event) {  // checkboxes
			var $table = $(event.target).closest('table');
			updateTotal($table);
		})
		.on('change', function(event) {  // recalc on each keypress
			var $table = $(event.target).closest('table');
			updateTotal($table);
		})
	;
})();
