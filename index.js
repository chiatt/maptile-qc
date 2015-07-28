#! /usr/bin/env node
var _ = require('underscore');
var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs'));
var qc = require('./qc');
var path = require('path')
var getopt = require('node-getopt').create([
  ['r' , 'zoomrange=ARG'  , 'comma delimited range of zoom levels to sample e.g. "2,10"'],
  ['l' , 'locations=ARG'  , 'number of locations to sample'],
  ['f' , 'samplefile=ARG'  , 'geojson file with sample points'],
  ['t' , 'tilecache=ARG'  , 'tile cache directory'],
  ['o' , 'outputfile=ARG'  , 'outputfile without extension'],
  ['e' , 'extent=ARG'  , 'sample region: xmin ymin xmax ymax'],
  ['c' , 'cellsize=ARG'  , 'distance between sample points'],
  ['h' , 'help'                , 'display this help'],
  ['v' , 'version'             , 'show version']
])              
.bindHelp()
.parseSystem();

var tilecacheDir = getopt.options.tilecache;
var zoomrangeInput = getopt.options.zoomrange;
var zoomrange = zoomrangeInput === undefined ? [10,15] : zoomrangeInput.split(',');
var extentInput = getopt.options.extent;
var extent = extentInput === undefined ? [-180,-90,180,90] : extentInput.split(',');
var minZoom = parseInt(zoomrange[0]);
var maxZoom = parseInt(zoomrange[1]);
var cellSize = parseFloat(getopt.options.cellsize);
var outputFile = getopt.options.outputfile;
var sampleFile = getopt.options.samplefile;
var outputPathExt = path.extname(outputFile).replace('.', '')
var records = [];
var metadata = {'zoomrange':zoomrange, 'tilecache':tilecacheDir, 'outputfile':outputFile}

function writeResults(locations) {
	var checkedTiles = [];
	var preppedTiles = [];
	_.each(locations, function(location){
		_.each(_.range(minZoom, maxZoom), function(zoom_level){
			var tilepath = qc.identifyTile(location, zoom_level, 'png');
			if (_.contains(checkedTiles, tilepath) === false) {
				var tileToQc = tilecacheDir + tilepath;
				var flag = fs.existsSync(tileToQc) === false ? 'missing' : '';
				var tile = qc.createTile(location['id'], zoom_level, tileToQc, location.x, location.y, flag)
				if (flag === 'missing') {
					records.push(tile[outputPathExt]());
				} else {
					preppedTiles.push(tile)
				}
				checkedTiles.push(tilepath);
			} 
		});
	});
	_.each(preppedTiles, function(tile){
		qc.createReportRecord(tile, function(ret){
			records.push(ret[outputPathExt]())
			if (records.length === checkedTiles.length){
				console.log('Writing results to', outputFile)
				if (outputPathExt === 'geojson') {
					fs.writeFileAsync(outputFile, JSON.stringify({ type: "FeatureCollection", features: records}))
				} else if (outputPathExt === 'csv') {
					fs.writeFileAsync(outputFile, records.join('\n'))
				}
				fs.writeFileAsync(outputFile + '.metadata', JSON.stringify(metadata, null, 2));
			}
		});
	});
}

if (sampleFile !== undefined) {
	qc.readSample(sampleFile, function(res){
		var locations = qc.geoJsonToLocations(res)
		metadata.samplefile = sampleFile
		metadata.locations = locations.length
		writeResults(locations)
	})
} else {
	locations = qc.getLocations(extent, cellSize);
	metadata.extent = extent;
	metadata.cellsize = cellSize;
	metadata.locations = locations.length;
	writeResults(locations);
}
