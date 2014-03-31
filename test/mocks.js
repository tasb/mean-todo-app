'use strict';

function mockLog() {
    return undefined;
}

module.exports.mockLogger = {
    trace: mockLog,
    debug: mockLog,
    info: mockLog,
    warn: mockLog,
    error: mockLog,
    fatal: mockLog
};