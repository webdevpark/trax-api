'use strict'

var Q = require('q'),
    md5 = require('md5'),
    streamifier = require('streamifier'),
    connections = require('../dao/connections'),
    mimeTypesMap = require('./mime-types-map'),
    documents = require('../dao/documents'),
    path = require('path');

var gridFs = connections.documentsGridFs;
var File = documents.models.File;

var FilesHelper = function () { };

FilesHelper.prototype.uploadAttachments = function(attachments) {
  let self = this;
  var work = attachments.map(self.uploadAttachment);
  return Q.all(work);
}

function getMIMEType(filename){
  var extension = path.extname(filename);
  if (!extension){
    return null;
  }
  extension = extension.substring(1);
  return mimeTypesMap[extension];
}

function addFile(filePath, filename, data) {

  let md5Hash = md5(data);
  let findOnePromise = Q.nbind(connections.documentsGridFs.findOne, connections.documentsGridFs);

  return findOnePromise({ md5: md5Hash})
    .then(function (file) {

      if (!file) {
        let buffer = new Buffer(data);
        let dataStream = streamifier.createReadStream(buffer);

          let writeStream = connections.documentsGridFs.createWriteStream({
            filename: path.join(filePath, filename),
            mode: 'w',
            content_type: getMIMEType(filename)
          });
          dataStream.pipe(writeStream);
          let onEventPromise = Q.nbind(writeStream.on, writeStream);

          return onEventPromise('close');
      }
      return Q(file);
    });
}

FilesHelper.prototype.uploadAttachment = function(attachment) {
  let filename = attachment.filename;
  let bytes = attachment.bytes;
  return addFile("FITS Attachment", filename, bytes)
    .then(function(fileMeta){
      if (!fileMeta) {
        throw "No file meta info was created or retrieved";
      }
      var fileInfo = new File({
        Created: Date.now(),
        DocumentId: fileMeta._id,
        FileName: filename,
        FileSize: fileMeta.length
      })
      return fileInfo.save().then(function(doc, numAffected){
          return doc._id;
        });
    });
}

module.exports = new FilesHelper();
