var mongoose = require('mongoose');
var Schema = mongoose.Schema;

workinghoursSchema = new Schema({
	header_label: { type: String, default: "" },
	week_hour: {
		type: Array, default: [
			{ "name": "Sun", "week_data": [{ "label": "", "from": "", "to": "" }] },
			{ "name": "Mon", "week_data": [{ "label": "", "from": "", "to": "" }] },
			{ "name": "Tue", "week_data": [{ "label": "", "from": "", "to": "" }] },
			{ "name": "Wed", "week_data": [{ "label": "", "from": "", "to": "" }] },
			{ "name": "Thu", "week_data": [{ "label": "", "from": "", "to": "" }] },
			{ "name": "Fri", "week_data": [{ "label": "", "from": "", "to": "" }] },
			{ "name": "Sat", "week_data": [{ "label": "", "from": "", "to": "" }] },
		]
	},
	user_id: { type: String, default: "" },
	is_delete: { type: Boolean, default: false },
	date: { type: Date, default: Date.now }
}),
	workinghours = mongoose.model('workinghours', workinghoursSchema);

module.exports = workinghours;