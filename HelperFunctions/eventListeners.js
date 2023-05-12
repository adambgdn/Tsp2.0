const submitButton = $('#solve')[0];
const downloadBtn = $('#download-btn')[0];
const inputField = $('#cities');

$(document).on('keydown', function (event) {
    if (event.key === 'Enter') {
        var activeElement = $(document.activeElement);
        if (activeElement.prop('tagName') === 'INPUT') {
            event.preventDefault();
            solve();
            return;
        }
        event.preventDefault();
        solve();
    }
});

$('#downloadBtn').on('click', function () {
    var logbox = $('#log-box')[0];
    var logData = logbox.textContent;
    var blob = new Blob([logData], { type: 'text/plain' });
    var url = URL.createObjectURL(blob);
    var a = $('<a></a>').attr({
        'href': url,
        'download': 'output.txt'
    })[0];
    a.click();
    URL.revokeObjectURL(url);
});

inputField.on("change", function () {
    calculateFactorial();
    const enteredValue = parseInt(inputField.val());
    const maxValue = parseInt(inputField.attr("max"));
    const minValue = parseInt(inputField.attr("min"));

    if (enteredValue > maxValue) {
        alert("Maximum allowed value for Cities is " + maxValue);
        inputField.val(maxValue);
    }
    if (enteredValue < minValue) {
        alert("Minimum allowed value for Cities is " + minValue);
        inputField.val(minValue);
    }
});
