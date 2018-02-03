var $rowTemplate = $('#row-template').clone().removeAttr('id');
$('#row-template').hide();

function addRowAfter($currentRow, $template) {
	$currentRow.after($template.clone());
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

function updateTotal() {
	var bonuses = [];
	$('#table > tr').each(function() {
		var value = $(this).find('.amount').val();
		var checked = $(this).find('.checkbox').prop('checked');
		if (value && checked) bonuses.push(value);
	});
	$('.total').text(sumBonuses(bonuses));
}

(function init() {
	addRowAfter($('#row-template'), $rowTemplate);
	$('table')
		.on('click', '.add-row', function() {
			var $thisRow = $(this).parent().parent();
			addRowAfter($thisRow, $rowTemplate);
		})
		.on('click', '.remove-row', function() {
			var $thisRow = $(this).parent().parent();
			$thisRow.remove();
			updateTotal();
		})
		.on('input', updateTotal)
	;
})();
