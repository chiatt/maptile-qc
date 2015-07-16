var expect = require('chai').expect,
    qc = require('../qc'),
    getLocations = qc.getLocations;

describe('#getLocations', function() {
  it('returns an array of loctions;', function() {
    expect(getLocations(2)).to.be.instanceof(Array);
  });
   it('has an x coordinate within longitude range;', function() {
    expect(getLocations(2)[0].x).to.be.within(-180, 181);
  });
   it('has a y coordinate value within latitude range;', function() {
    expect(getLocations(2)[0].y).to.be.within(-90, 90);
  });
});

// expect([{a:'a'}, {a:'b'}]).to.deep.have.same.members([{a:'a'}, {a:'b'}]);