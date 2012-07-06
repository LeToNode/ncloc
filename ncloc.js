var fs = require('fs');

var moment = require('moment');
var EventProxy = require('eventproxy').EventProxy;
var SourceInfo = require('./SourceInfo.js').SourceInfo;



exports.clocWithPath = function(rootpath) {
	console.log("ncloc start time is :" + moment().unix());


	var res = getAllFilesInfoSync(rootpath);
	console.log("ncloc start time is :" + moment().unix());

	var done = function(sourceInfos) {
			var totalBlankLines = 0;
			var totalInlineComments = 0;
			var total = 0;
			if (sourceInfos.length > 0) {
				for (var i = 0; i < sourceInfos.length; i++) {
					total += sourceInfos[i].total;
					totalBlankLines += sourceInfos[i].blankLines;
					totalInlineComments += sourceInfos[i].inlineComments;
				}
			}
			console.log("contain files:" + sourceInfos.length);
			console.log("total lines  :" + total);
			console.log("blank lines:" + totalBlankLines);
			console.log("inlineComments:" + totalInlineComments);

			console.log("ncloc end time is :" + moment().unix());
		}
	var proxy = new EventProxy();

	proxy.after('count_source_lines', res.length, done);

	res.forEach(function(filepath){
		clocWithFullPath(filepath, proxy);
	});
	


}


function getAllFilesInfoSync(root) {
	var res = [];
	var files = fs.readdirSync(root);
	files.forEach(function(file) {
		var pathname = root + '/' + file;
		var stat = fs.lstatSync(pathname);

		if (!stat.isDirectory()) {
			if (isSourceFile(pathname)) {
				res.push(pathname);//pathname.replace(root, '.')
			}
		} else {
			res = res.concat(getAllFilesInfoSync(pathname));
		}
	});
	return res
}

function clocWithFullPath(filename, proxy) {

	var input = fs.createReadStream(filename);
	var remaining = '';
	var count = 0;
	var blankLines = 0;
	var inlineComments = 0;


	input.on('data', function(data) {
		remaining += data;
		var index = remaining.indexOf('\n');
		var last = 0;
		while (index > -1) {
			var line = remaining.substring(last, index);
			var trimedLine = line.trim();
			if (trimedLine == '') {
				blankLines++;
			}
			if (trimedLine.indexOf('//') > -1) {
				inlineComments++;
			}
			last = index + 1;
			count++;
			index = remaining.indexOf('\n', last);
		}

		remaining = remaining.substring(last);
	});

	input.on('end', function() {

		if (remaining.length > 0) {
			count++;
			if (remaining.trim() == '') {
				blankLines++;
			}
			if (remaining.indexOf('//') > -1) {
				inlineComments++;
			}
		}
		var datainfo = new SourceInfo;
		datainfo.total = count;
		datainfo.filename = filename;
		datainfo.blankLines = blankLines;
		datainfo.inlineComments = inlineComments;
		//console.log(datainfo);
		proxy.trigger("count_source_lines", datainfo);
	});
}

function isSourceFile(filename) {
	if (filename.substring(filename.length - 5) == '.java') {
		return true;
	} else {
		return false;
	}

}