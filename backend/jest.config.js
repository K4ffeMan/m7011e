/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    roots: [
        '<rootDir>', // /backend
        '../testing-ci', // /testing-ci
    ],
    testMatch: [
        '**/*.test.ts', // match all .test.ts files under the roots
    ],
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/tsconfig.json',
        },
    },
};
