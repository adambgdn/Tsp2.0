const submitButton = document.getElementById('solve');
const downloadBtn = document.getElementById('download-btn');

document.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement.tagName === 'INPUT') {
            event.preventDefault();
            solve();
            return;
        }
        event.preventDefault();
        solve();
    }
});

downloadBtn.addEventListener('click', () => {
    const logbox = document.getElementById('log-box');
    const logData = logbox.textContent;
    const blob = new Blob([logData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'output.txt';
    a.click();
    URL.revokeObjectURL(url);
});

const inputField = document.getElementById("cities");

inputField.addEventListener("change", function () {
    calculateFactorial();
    const enteredValue = parseInt(inputField.value);
    const maxValue = parseInt(inputField.getAttribute("max"));
    const minValue = parseInt(inputField.getAttribute("min"));

    if (enteredValue > maxValue) {
        alert("Maximum allowed value for Cities is " + maxValue);
        inputField.value = maxValue;
    }
    if (enteredValue < minValue) {
        alert("Minimum allowed value for Cities is " + minValue);
        inputField.value = minValue;
    }
});
