"use strict"
/**
 * Common job object helper
 * @module lib/job-helper.js
 */

require('moment-duration-format');
var moment  = require('moment'),
    _       = require('lodash');

var FormatHelper = function () { };

/**
 * Creates a user data object from an authentication cookie
 * @func makeUser
 * @param user {Object} The user
 */
FormatHelper.prototype.toTimeSpanString = function (magnitude, precision) {
  let duration = null;
  if (precision) {
    duration = moment.duration(magnitude, precision)
  } else {
    duration = moment.duration(magnitude); //default millis
  }
  //retaining timespan format used by .net
  if (duration.asDays()>= 1) {
    return duration.format('d.HH:mm:ss', {trim:false});
  } else {
    return duration.format('HH:mm:ss', {trim:false});
  }
}

/**
 * takes a string and replaces any text wrapped in {} with values from an object property described by the text in {}
 * e.g. substituteObjectPropertyValues("{a} {b[0]} {c.d} {e}", {a: "this", b:["is"], c:{d:"a"}, e: "test"}) => "this is a test"
 * if a property is not described by the text in {}, no substitution is made
 * @param str the string to substituteObjectPropertyValues
 * @param obj the object to use for the property values.
 */
FormatHelper.prototype.substituteObjectPropertyValues = function(str, obj) {
  if (!obj) {
    return str;
  }
//  REGEX:  /\{([^\{\}]*)\}/g
// \{ matches the character { literally
// 1st Capturing group ([^\{\}]*)
// [^\{\}]* match a single character not present in the list below
// Quantifier: * Between zero and unlimited times, as many times as possible, giving back as needed [greedy]
// \{ matches the character { literally
// \} matches the character } literally
// \} matches the character } literally
// g modifier: global. All matches (don't return on first match)
  return str.replace(/\{([^\{\}]*)\}/g, function(match, p1){
    return _.get(obj, p1, p1);
  });
}

/**
 * takes a string representing a sql query and replaces any text wrapped in {} with a sql parameter name, and returns the parameterised sql along with
 * the parameter names and values.
 *
 * e.g. substituteSqlQuery("select * from '{a}'", {a: "table1"}) => ({
    sql: "select * from ':1'",
    parameters: [{1: 'table1'}]
  })
 * if a property is not described by the text in {}, no substitution is made
 * any substitutions are also returned as
 * @param str the string to substituteObjectPropertyValues
 * @param obj the object to use for the property values.
 */
FormatHelper.prototype.substituteSqlQuery = function(str, obj) {
  if (!obj) {
    return {sql: str, parameters:{}};
  }
  let params = {};
//  REGEX:  /\{([^\{\}]*)\}/g
// \{ matches the character { literally
// 1st Capturing group ([^\{\}]*)
// [^\{\}]* match a single character not present in the list below
// Quantifier: * Between zero and unlimited times, as many times as possible, giving back as needed [greedy]
// \{ matches the character { literally
// \} matches the character } literally
// \} matches the character } literally
// g modifier: global. All matches (don't return on first match)
  var query = str.replace(/\{([^\{\}]*)\}/g, function(match, p1){
    let val = _.get(obj, p1, null);
    if (val) {
      let param = p1
        .replace('.', '')
        .replace('[', '')
        .replace(']', '');

      params[param] = String(val);
      var replaced = `:${param}`;
      return replaced;
    }
    return p1;
  });
  return {
    sql: query,
    parameters: params
  }
}

module.exports = new FormatHelper();
