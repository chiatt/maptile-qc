#! /usr/bin/env node
var _ = require('underscore');
var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs'));
var qc = require('./qc');
var getopt = require('node-getopt').create([
  ['r' , 'zoomrange=ARG'  , 'comma delimited range of zoom levels to sample e.g. "2,10"'],
  ['l' , 'locations=ARG'  , 'number of locations to sample'],
  ['t' , 'tilecache=ARG'  , 'tile cache directory'],
  ['o' , 'outputfile=ARG'  , 'outputfile without extension'],
  ['h' , 'help'                , 'display this help'],
  ['v' , 'version'             , 'show version']
])              
.bindHelp()
.parseSystem();

var tilecacheDir = getopt.options.tilecache;
var zoomrange = getopt.options.zoomrange.split(',')
var minZoom = parseInt(zoomrange[0]);
var maxZoom = parseInt(zoomrange[1]);
var locationSampleSize = getopt.options.locations;
var geojsonFile = getopt.options.outputfile + '.geojson';
var csvFile = getopt.options.outputfile + '.csv';

var geojson = [];
var csv = [];

function main() {
	locations = qc.getLocations(locationSampleSize);
	_.each(locations, function(location){
		_.each(_.range(minZoom, maxZoom), function(zoom_level){
			var tile = qc.identifyTile(location, zoom_level, 'png');
			var tileToQc = tilecacheDir + tile;
			if (fs.existsSync(tileToQc) === false) {
				var flag = 'missing'
				var missingTile = qc.createTile(location['id'], zoom_level, tileToQc, location['x'], location['y'], flag)
				geojson.push(missingTile.asGeoJson())
				csv.push(missingTile.asString())
			} else {
				qc.createReportRecord( zoom_level, location, tileToQc, '', function(ret){
					geojson.push(ret.asGeoJson())
					csv.push(ret.asString())
					if (geojson.length === (maxZoom - minZoom) * locationSampleSize) {
						fs.writeFileAsync(geojsonFile, JSON.stringify({ type: "FeatureCollection", features: geojson}))
						fs.writeFileAsync(csvFile, csv.join('\n'))
					}
				})
			}
		});
	});
	}

main();