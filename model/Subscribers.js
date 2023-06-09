const mongoose  = require('mongoose');
const Schema = mongoose.Schema;

const SubscribersSchema = new Schema({
    subscriberUrl : { type : String , required: true }
},{timestamps: true});

const Subscribers = mongoose.model('SubscribersUrls',SubscribersSchema)

module.exports = Subscribers;