var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var MeshSchema = new Schema({
  meshName: {
    type: String,
    unique: true,
    required: true
  },
  meshCreatedAtTime: {
    type: String,
  },
  meshStartTime: {
    type: String
  },
  meshStartTimeMilliSec: {
    type: Number
  },
  meshEndTime: {
    type: String
  },
  meshEndTimeMilliSec: {
    type: Number
  },
  meshCoordinate: {
    lat: Number,
    lng: Number
  },
  meshCreatedCoordinate: {
    lat: Number,
    lng: Number
  }, 
  peakParticipantNumber: {
    type: Number,
    default: 0
  },
  chat: [{
    userID: String,
    message: String
  }],
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }]
});

var Mesh = mongoose.model("Mesh", MeshSchema);
module.exports = Mesh;