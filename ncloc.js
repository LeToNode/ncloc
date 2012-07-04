var fs = require('fs');

var moment = require('moment');
var EventProxy = require('eventproxy').EventProxy;
var SourceInfo = require('./SourceInfo.js').SourceInfo;


exports.clocWithPath = function(rootpath) {
	console.log("ncloc start time is :" + moment().unix());
	var res = getAllFilesInfoSync(rootpath);

	var done = function(sourceInfos) {
			var totalBlankLines = 0;

			var total = 0;
			if (sourceInfos.length > 0) {
				for (var i = 0; i < sourceInfos.length; i++) {
					total += sourceInfos[i].total;
					totalBlankLines += sourceInfos[i].blankLines;
				}
			}
			console.log(total);
			console.log(totalBlankLines);

			console.log("ncloc end time is :" + moment().unix());
		}
	var proxy = new EventProxy();
	proxy.after('count_source_lines', res.length, done);

	getAllFiles(rootpath, proxy);


}


function getAllFilesInfoSync(root) {
	var res = [];
	var files = fs.readdirSync(root);
	files.forEach(function(file) {
		var pathname = root + '/' + file
		var stat = fs.lstatSync(pathname);

		if (!stat.isDirectory()) {
			if(isSourceFile(pathname)) {
				res.push(pathname.replace(root, '.'));
			}
		} else {
			res = res.concat(getAllFilesInfoSync(pathname));
		}
	});
	return res
}


function getAllFiles(root, proxy) {

	fs.readdir(root, function(err, files) {
		files.forEach(function(file) {
			var pathname = root + '/' + file
			var stat = fs.lstatSync(pathname);

			if (!stat.isDirectory()) {
				if (isSourceFile(pathname)) {
					clocWithFullPath(pathname, proxy);
				}
			} else {
				getAllFiles(pathname, proxy);
			}
		});
	});

}


function clocWithFullPath(filename, proxy) {

	var input = fs.createReadStream(filename);
	var remaining = '';
	var count = 0;
	var blankLines = 0;


	input.on('data', function(data) {
		remaining += data;
		var index = remaining.indexOf('\n');
		var last = 0;
		while (index > -1) {
			var line = remaining.substring(last, index);
			if (line.trim() == '') {
				blankLines++;
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
		}
		var datainfo = new SourceInfo;
		datainfo.total = count;
		datainfo.filename = filename;
		datainfo.blankLines = blankLines;
		//console.log(datainfo);


		proxy.trigger("count_source_lines", datainfo);

		// console.log(filename+":"+count);
	});
}

function isSourceFile(filename){
	if (filename.substring(filename.length - 5) == '.java') {
		return true;
	} else {
		return false;
	}

}