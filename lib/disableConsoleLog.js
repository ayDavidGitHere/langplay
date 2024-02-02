// disableConsoleLog.js

function disableConsoleLog() {
    // Save the original console.log function
    const originalConsoleLog = console.log;

    // Override console.log with an empty function
    console.log = function () {};

    // Return a function to re-enable console.log if needed
    return function enableConsoleLog() {
        console.log = originalConsoleLog;
    };
}

// Export the disableConsoleLog function
module.exports = disableConsoleLog;
