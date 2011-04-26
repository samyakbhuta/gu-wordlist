/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var ObjectId = Schema.ObjectId;

/**
 * Schema definition
 */

var WordSchema = new Schema({
    id	      : ObjectId	
  , timestamp : Date
  , source  : String
  , wordText  : String
});


mongoose.model('Word', WordSchema);
exports.wordModel = mongoose.model('Word');



