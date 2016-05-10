/**
 * Unit test example
 * @module test/unit
 */


var expect = require('chai').expect;
var formatHelper = require('../lib/format-helper');
var somethingToTest = function (valueIn) {
  return valueIn;
};

describe('Test', function() {

  it('#somethingToTest', function(done) {
    expect(somethingToTest('hello')).is.eq('hello');
    done();
  });

});

describe('TimeSpan tests', function(){
  it('should format seconds from millis correctly', function(){
    expect(formatHelper.toTimeSpanString(1000)).to.eq('00:00:01');
  });
  it('should format seconds from seconds correctly', function(){
    expect(formatHelper.toTimeSpanString(1, 'second')).to.eq('00:00:01');
  });
  it('should format minutes correctly', function(){
    expect(formatHelper.toTimeSpanString(1, 'minute')).to.eq('00:01:00');
  });
  it('should format hours correctly', function(){
    expect(formatHelper.toTimeSpanString(1, 'hour')).to.eq('01:00:00');
  });
  it('should format days correctly', function(){
    expect(formatHelper.toTimeSpanString(1, 'day')).to.eq('1.00:00:00');
  });
  it('should format days > 365 correctly', function(){
    expect(formatHelper.toTimeSpanString(1000, 'day')).to.eq('1000.00:00:00');
  });
  it('should format days = 365 correctly', function(){
    expect(formatHelper.toTimeSpanString(365, 'day')).to.eq('365.00:00:00');
  });
  it('should format mixed correctly', function(){
    expect(formatHelper.toTimeSpanString((1000 * 24 * 60 * 60) + (3 * 60 * 60) + (2 * 60) + 45, 'second')).to.eq('1000.03:02:45');
  });
})

describe('substituteObjectPropertyValuesTests', function(){
  it('should succeed when no brackets in string', function(){
    expect(formatHelper.substituteObjectPropertyValues('no substitutes', {a:"1"})).to.eq('no substitutes');
  });
  it('should succeed when no object passed', function(){
    expect(formatHelper.substituteObjectPropertyValues('this is a {test}')).to.eq('this is a {test}');
  });
  it('should succeed with shallow property substitution', function(){
    expect(formatHelper.substituteObjectPropertyValues('this is a {a}', {a:"test"})).to.eq('this is a test');
  });
  it('should succeed with deep property substitution', function(){
    expect(formatHelper.substituteObjectPropertyValues('this is a {a.b}', {a:{b:"test"}})).to.eq('this is a test');
  });
  it('should succeed with array property substitution', function(){
    expect(formatHelper.substituteObjectPropertyValues('this is a {a[0]}', {a:["test"]})).to.eq('this is a test');
  });
  it('should succeed with deep array property substitution', function(){
    expect(formatHelper.substituteObjectPropertyValues('this is a {a[0][0]}', {a:[["test"]]})).to.eq('this is a test');
  });
  it('should succeed with mixed property substitution', function(){
    expect(formatHelper.substituteObjectPropertyValues('{a} {b[0]} {c.d} {e}', {a: "this", b:["is"], c:{d:"a"}, e: "test"})).to.eq('this is a test');
  });
});

describe('substituteSqlQuery Tests', function(){
  it('should succeed when no brackets in string', function(){
    expect(formatHelper.substituteSqlQuery('no substitutes', {a:"1"}).sql).to.eq('no substitutes');
  });
  it('should succeed when no object passed', function(){
    var res = formatHelper.substituteSqlQuery('this is a {test}');
    expect(res.sql).to.eq('this is a {test}');
  });
  it('should succeed with shallow property substitution', function(){
    var res = formatHelper.substituteSqlQuery('this is a {a}', {a:"test"});
    expect(res.sql).to.eq('this is a :a');
    expect(res.parameters["a"]).to.eq('test');
  });
  it('should succeed with multiple property substitution', function(){
    var res = formatHelper.substituteSqlQuery('this is {a} {b}', {a: "a", b: "test"});
    expect(res.sql).to.eq('this is :a :b');
    expect(res.parameters["a"]).to.eq('a');
    expect(res.parameters["b"]).to.eq('test');
  });
});
