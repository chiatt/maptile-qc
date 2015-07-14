#! /usr/bin/env node

var _ = require('underscore');
var Promise = require('bluebird')
var gm = require('gm').subClass({imageMagick: true});
Promise.promisifyAll(gm.prototype)

module.exports.createTile = function(id, zoom, tile, x, y, flag) {
	var geom = 'wkt';
	var tile = {
		id : id,
		zoom : zoom,
		tile : tile,
		red_mean : 0,
		green_mean : 0,
		blue_mean : 0,
		red_stddev : 0,
		green_stddev : 0,
		blue_stddev : 0,
		flag : flag,
		x : x,
		y : y,
		format : '',
		depth : '',
		geom : geom,
		asString: function(){
			var result = [];
			var line = '';
			_.each(this, function(v, k){
					if (_.isFunction(v) === false) {
						result.push(v);
					}
				}, this);

			line = result.join('|');
			return line;
			}
		,asGeoJson: function(){
			var props = {};
			_.each(this, function(v, k){
					if (_.isFunction(v) === false && k != 'x' && k != 'y') {
						props[k] = v;
					}
				}, this);
			return	{
					  type: "Feature",
					  geometry: {
					    type: "Point",
					    coordinates: [this.x, this.y]
					  },
					  properties: props
					 }
				}
		}
	return tile
}

module.exports.identifyTile = function(location, zoom_level, tile_extension) {
	var lat = location['y']
	var lon = location['x']
 	var x = (Math.floor((lon+180)/360*Math.pow(2, zoom_level)));
	var y = (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom_level)));
	return "/" + zoom_level + "/" + x + "/" + y + "." + tile_extension
}

module.exports.getLocations = function(numOfLocations) {
	var iter = _.range(numOfLocations)
	var locations = [];
	_.each(iter, function(i){
		var randx = _.random(0,100)/100;
		var randy = _.random(0, 100)/100;
		locations.push({'id': i, 'x': -122 + randy, 'y': 37 + randx})
	}, this);
	return locations;
}

module.exports.verifyTile = function(image, tile_type) {
    mode_to_bpp = {'1':1, 'L':8, 'P':8, 'RGB':24, 'RGBA':32, 'CMYK':32, 'YCbCr':24, 'I':32, 'F':32}
    verification_results = {
        'file_format':'',
        'pixel_depth':'',
        'tile_error':''
    }
}

module.exports.createReportRecord = function(zoom_level, location, tileToQc, flag, cb) {
	var tile = module.exports.createTile(location['id'], zoom_level, tileToQc, location['x'], location['y'], flag)
	var img = gm(tileToQc);
	img.formatAsync()
		.then(function(result){
			tile['format'] = result;
			})
		.then(function(){
			img.depthAsync()
			})
		.then(function(result){
			tile['depth'] = result
			cb(tile)
			return (tile.tile)
			})
		.then(
	        function (ret) {
	            // console.log("Most recent tile:", ret);
	        },
	        function (error) {
	            console.error("Problem getting image detials:", error);
	        }
	    );
	}