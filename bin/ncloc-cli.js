#!/usr/bin/env node

var ncloc = require("../ncloc.js");


var root = process.cwd();
ncloc.clocWithPath(root);