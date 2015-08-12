module.exports = {
  verbose: true,
  plugins: {
    local: {
      root: 'build',
      suites: ['**/elements/**/tests/**'],
      browsers: ['chrome', 'firefox', 'ie']
    }
  },
};
