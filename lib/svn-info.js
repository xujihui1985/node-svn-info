'use strict';

var sh = require('shelljs');

var normalizeInfo = function(raw) {
  var lines = raw.trim().split(/\r?\n/)
    , normInfoObj = {};

  var normalizationMap = {
    'Path': 'path',
    'Working Copy Root Path': 'workingCopyRootPath',
    'URL': 'url',
    'Relative URL': 'relativeUrl',
    'Repository Root': 'repositoryRoot',
    'Repository UUID': 'repositoryUuid',
    'Revision': 'revision',
    'Node Kind': 'nodeKind',
    'Schedule': 'schedule',
    'Last Changed Author': 'lastChangedAuthor',
    'Last Changed Rev': 'lastChangedRev',
    'Last Changed Date': 'lastChangedDate'
  };

  lines.forEach(function(l) {
    var keyVal = l.split(':'), key, val;
    if(keyVal.length > 1) {
      key = keyVal.shift().trim();
      val = keyVal.join(':').trim();
      if(normalizationMap.hasOwnProperty(key)) {
        normInfoObj[normalizationMap[key]] = val;
      }
    }
  });

  return normInfoObj;
};

module.exports = function(path, rev, cb) {
  if(arguments.length === 1) {
    cb = path;
    path = '.';
    rev = 'HEAD';
  } else if(arguments.length === 2) {
    cb = rev;
    rev = 'HEAD';
  }

  if(/\s/.test(path)) {
    path = path
      .replace(/^['"]+/g, '')
      .replace(/["']+$/g, '');
    path = '"' + path + '"';
  }

  sh.exec('svn info ' + path, {silent: true}, function(code, output) {
    if(0 !== code) {
      return cb(new Error('Encountered an error trying to get svn info for ' + path + '\n' + output));
    }
    cb(null, normalizeInfo(output));
  });
};

module.exports.sync = function(path, rev) {
  path = path || '.';
  rev = rev || 'HEAD';
  var cmd = sh.exec('svn info -r ' + rev + ' ' + path, {silent: true});
  if(0 !== cmd.code) {
    throw new Error('Encountered an error trying to get svn info for ' + path + '\n' + cmd.output);
  }
  return normalizeInfo(cmd.output);
};
