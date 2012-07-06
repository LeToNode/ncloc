(function() {

  var ClocInfo = function() {
      if (!(this instanceof ClocInfo)) {
        return new ClocInfo();
      }
    };
  // Event proxy can be used in browser and Nodejs both.
  if (typeof exports !== "undefined") {
    exports.ClocInfo = ClocInfo;
  } else {
    this.ClocInfo = ClocInfo;
  }

}());