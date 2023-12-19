module.exports = {
  //...
  resolve: {
    fallback: {
      "path": require.resolve("path-browserify"),
      "buffer": false, 
    }
  }
};