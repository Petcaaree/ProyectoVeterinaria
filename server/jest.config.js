/** @type {import('jest').Config} */
export default {
    transform: {},
    testEnvironment: 'node',
    testMatch: [
        '<rootDir>/test/**/*.test.js'
    ],
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'vet/**/*.js',
        '!vet/config/**',
        '!vet/routes/**',
        '!vet/models/schemas/**'
    ],
    // Timeout generoso para tests que usan bcrypt
    testTimeout: 15000
};
