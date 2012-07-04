(function() {

  var SourceInfo = function() {
      if (!(this instanceof SourceInfo)) {
        return new SourceInfo();
      }
    };
  // Event proxy can be used in browser and Nodejs both.
  if (typeof exports !== "undefined") {
    exports.SourceInfo = SourceInfo;
  } else {
    this.SourceInfo = SourceInfo;
  }

}());