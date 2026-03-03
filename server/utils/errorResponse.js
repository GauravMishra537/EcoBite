/**
 * Custom error class for API errors.
 * Extends the built-in Error class with an HTTP status code.
 */
class ErrorResponse extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

module.exports = ErrorResponse;
