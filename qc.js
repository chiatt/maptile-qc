#! /usr/bin/env node

var _ = require('underscore');
var Promise = require('bluebird')
var turf = require('turf');
var fs = Promise.promisifyAll(require('fs'));
var gm = require('gm').subClass({imageMagick: false});
Promise.promisifyAll(gm.prototype)

module.exports.readSample = function(filename, cb){
    fs.readFileAsync(filename, "utf8", function(err, data) {
        if (err) throw err;
    }).then(function(ret){        
        cb(JSON.parse(ret));
    });  
}

module.exports.createTile = function(id, zoom, tile, x, y, flag) {
    var geom = 'wkt';
    var tile = {
        id : id,
        zoom : zoom,
        tilepath : tile,
        colors : 0,
        flag : flag,
        x : x,
        y : y,
        format : '',
        depth : '',
        filesize : '',
        geom : geom,
        csv: function(){
            var result = [];
            var line = '';
            _.each(this, function(v, k){
                    if (_.isFunction(v) === false) {
                        result.push(v);
                    }
                }, this);

            line = result.join('|');
            return line;
            },
        geojson: function(){
            var props = {};
            _.each(this, function(v, k){
                    if (_.isFunction(v) === false && k != 'x' && k != 'y') {
                        props[k] = v;
                    }
                }, this);
            return  {
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

module.exports.geoJsonToLocations = function(geojson) {
    locations = [];
    points = geojson.features
    console.log('Checking', points.length, 'locations')
    _.each(points, function(point, i){
        var x = point.geometry.coordinates[0];
        var y = point.geometry.coordinates[1];
        locations.push({'id': i, 'x': x, 'y': y})
    })
    return locations
}

module.exports.getLocations = function(extent, cellSize) {
    var units = 'degrees';
    var minx = parseFloat(extent[0])
    var miny = parseFloat(extent[1])
    var maxx = parseFloat(extent[2])
    var maxy = parseFloat(extent[3])
    var grid = turf.pointGrid([minx, miny, maxx, maxy], cellSize, units);
    return module.exports.geoJsonToLocations(grid);
}

module.exports.createReportRecord = function(tile, cb) {
    var img = gm(tile.tilepath);
    img.formatAsync()
    .then(function(format, error){
        img.depthAsync()
    .then(function(depth){
        img.filesizeAsync()
    .then(function(filesize){
        img.colorAsync()
    .then(function(colors){
        tile['depth'] = depth;
        tile['format'] = format;
        tile['colors'] = colors;
        tile['filesize'] = filesize;
        return tile
    }).then(function (ret) {
                cb(ret)
            },
            function (error) {
                console.error("Problem getting image detials:", error);
            });
    })
    })
    })
}
