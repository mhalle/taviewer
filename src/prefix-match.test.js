const prefix_match = require('./prefix-match');

test('tests for two prefixes', () => {
    expect(prefix_match('lef thal', 'left thalamus')).toBe(true);
});

test('tests for one prefix', () => {
    expect(prefix_match('lef', 'left thalamus')).toBe(true);
});

test('tests for empty prefix', () => {
    expect(prefix_match('', 'left thalamus')).toBe(true);
});

test('tests for empty string', () => {
    expect(prefix_match('left', '')).toBe(false);
});

