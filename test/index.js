var expect = require('chai').expect,
    qc = require('../qc'),
    gv = require('geojson-validation'),
    extent = ['-180','-90','180','90'],
    getLocations = qc.getLocations;
    Promise = require('bluebird')
    fs = Promise.promisifyAll(require('fs'));

describe('#getLocations', function() {
  it('returns an array of loctions;', function() {
    expect(getLocations(extent, 25.0)).to.be.instanceof(Array);
  });
   it('has an x coordinate within longitude range;', function() {
    expect(getLocations(extent, 25.0)[0].x).to.be.within(-180, 181);
  });
   it('has a y coordinate value within latitude range;', function() {
    expect(getLocations(extent, 25.0)[0].y).to.be.within(-90, 90);
  });
});

describe('#readSample', function() {
  it('returns valid geojson;', function(done) {
      qc.readSample('/home/cyrus/Projects/temp/tilevalidator/test.geojson', function(res){
      done();
      var isValid = gv.valid(res);
      expect(isValid).to.be.true;
    })
  });
});

describe('#createTile.geojson', function() {
  it('returns valid geojson;', function() {
    var testtile = qc.createTile(0, 10, 'a/test/path', '-122', '37.0', '')
    var geojsonTile = testtile.geojson()
    var isValid = gv.valid(geojsonTile)
    expect(isValid).to.be.true;
  });
});

describe('#identifyTile', function() {
  it('locates a test tile in the test directory;', function() {
    var tilepath = qc.identifyTile({'x':-122.4,'y':37.7}, 10, 'png')
    var fileExists = fs.existsSync('test/data' + tilepath);
    expect(fileExists).to.be.true;
  });
});

describe('#createReportRecord', function() {
    var tilepath = qc.identifyTile({'x':-122.4,'y':37.7}, 10, 'png')
    var testtile = qc.createTile(0, 10, 'test/data' + tilepath, -122.4, 37.7, '')
  it('returns a record with expected image format;', function(done) {
    qc.createReportRecord(testtile, function(record){
      done();
      expect(record.format).to.equal('PNG');
    })
  });
  it('returns a record with expected depth;', function(done) {
    qc.createReportRecord(testtile, function(record){
      done();
      expect(record.depth).to.equal('8');
    })
  });
  it('returns a record with expected colors;', function(done) {
    qc.createReportRecord(testtile, function(record){
      done();
      expect(record.colors).to.equal(256);
    })
  });
  it('returns a record with expected filesize;', function(done) {
    qc.createReportRecord(testtile, function(record){
      done();
      expect(record.filesize).to.equal('18.4K');
    })
  });
});

