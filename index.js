#! /usr/bin/env node
var _ = require('underscore');
var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs'));
var qc = require('./qc');
var path = require('path')
var getopt = require('node-getopt').create([
  ['r' , 'zoomrange=ARG'  , 'comma delimited range of zoom levels to sample e.g. "2,10"'],
  ['l' , 'locations=ARG'  , 'number of locations to sample'],
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
var zoomrange = getopt.options.zoomrange.split(',');

var extentInput = getopt.options.extent;
var extent = extentInput === undefined ? [-180,-90,180,90] : extentInput.split(',');
var minZoom = parseInt(zoomrange[0]);
var maxZoom = parseInt(zoomrange[1]);
var cellSize = parseFloat(getopt.options.cellsize);
var outputFile = getopt.options.outputfile;
var outputPathExt = path.extname(outputFile).replace('.', '')
var records = [];

function main() {
	locations = qc.getLocations(extent, cellSize);
	_.each(locations, function(location){
		_.each(_.range(minZoom, maxZoom), function(zoom_level){
			var tile = qc.identifyTile(location, zoom_level, 'png');
			var tileToQc = tilecacheDir + tile;
			if (fs.existsSync(tileToQc) === false) {
				var flag = 'missing'
				var missingTile = qc.createTile(location['id'], zoom_level, tileToQc, location.x, location.y, flag)
				records.push(missingTile[outputPathExt]())
			} else {
				qc.createReportRecord( zoom_level, location, tileToQc, '', function(ret){
					records.push(ret[outputPathExt]())
					if (records.length === (maxZoom - minZoom) * locations.length) {
						if (outputPathExt === 'geojson') {
							fs.writeFileAsync(outputFile, JSON.stringify({ type: "FeatureCollection", features: records}))
						} else if (outputPathExt === 'csv') {
							fs.writeFileAsync(outputFile, records.join('\n'))
						}
					}
				})
			}
		});
	});
	}

main();