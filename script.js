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
	var $newFormula = $formulaTemplate.clone();
	$newFormula.find('#row-template').removeAttr('id');
	$formulas.eq(index).after($newFormula);
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

function supports_html5_storage() { // from https://stackoverflow.com/a/18250402
	try {
		return 'localStorage' in window && window['localStorage'] !== null;
	} catch(e) {
		return false;
	}
}

function saveData() {
	var data = [];
	$('.formula').each(function() {
		var formulaName = $(this).find('.formula-name').val();
		var formulaRows = [];
		var $rows = $(this).find('.table tr').not('#row-template');
		$rows.each(function() {
			var rowData = {
				name: $(this).find('.name').val(),
				amount: $(this).find('.amount').val(),
				checkbox: $(this).find('.checkbox').is(':checked'),
			};
			formulaRows.push(rowData);
		});
		var formulaData = {
			formulaName,
			formulaRows,
		};
		data.push(formulaData);
	});
	localStorage.setItem('data', JSON.stringify(data));
}
function loadData() {
	var data = JSON.parse(localStorage.getItem('data'));
	$('.formula').remove();
	data.forEach(function(formulaData) {
		$('body').append(renderFormula(formulaData));
	});
}
function clearData() {
	Storage.clear();
}

function renderFormula(formulaData) {
	var $formula = $formulaTemplate.clone()
		.find('.formula-name').val(formulaData.formulaName).end();
	var $table = $formula.find('.table');
	$table.find('tr').remove();
	formulaData.formulaRows.forEach(function(rowData) {
		$table.append(renderRow(rowData));
	});
	updateTotal($table.parent());
	return $formula;
}

function renderRow(rowData) {
	return $rowTemplate.clone()
		.find('.name').val(rowData.name).end()
		.find('.amount').val(rowData.amount).end()
		.find('.checkbox').prop("checked", rowData.checkbox).end()
	;
}

(function init() {
	if (!supports_html5_storage()) alert("Your browser does not support HTML5 storage, so your data will not be saved.");
	addRowAfter($('#row-template'), $rowTemplate);
	$('body')
		.on('click', '.add-formula', function() {
			var indexInFormulas = $('.formula').index($(this).parent());
			newFormula(indexInFormulas);
		})
		.on('click', '.remove-formula', function() {
			var $thisFormula = $(this).parent();
			var formulaName = $thisFormula.find('.formula-name').val();
			var warning = formulaName ? "Really delete the " + formulaName + " formula?" : "Really delete this formula?";
			function formulaIsEmpty() {
				$rows = $thisFormula.find('.table tr');
				if ($rows.length > 1) return false;
				if ($rows.find('.name').val() == "" && $rows.find('.amount').val() == "") return true;
			}
			if (formulaIsEmpty() || confirm(warning)) $thisFormula.remove();
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
