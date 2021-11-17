var mongoose = require('mongoose');
var Schema = mongoose.Schema;

userSchema = new Schema({
	email: String,
	guid: String,	
	image: { type: String, default: "" },
	office_email: { type: String, default: "" },
	name:  { type: String, default: "" },
	title:  { type: String, default: "" },
	mobile:  { type: String, default: "" },
	phone:  { type: String, default: "" },
	address:  { type: String, default: "" },
	facebook:  { type: String, default: "" },
	whatsapp:  { type: String, default: "" },
	linkedin:  { type: String, default: "" },
	twitter:  { type: String, default: "" },
}),
	userSchema.set('timestamps', true);
user = mongoose.model('user', userSchema);

module.exports = user;