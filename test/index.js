var expect = require('chai').expect,
    qc = require('../qc'),
    gv = require('geojson-validation'),
    extent = ['-180','-90','180','90'],
    getLocations = qc.getLocations;

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

describe('#createTile.geojson', function() {
  it('returns valid geojson;', function() {
    var testtile = qc.createTile(0, 10, 'a/test/path', '-122', '37.0', '')
    var geojsonTile = testtile.geojson()
    var isValid = gv.valid(geojsonTile)
    expect(isValid).to.be.true;
  });
});
