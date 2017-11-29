var URL = "";
if (process.env.PORT) URL = '';
else URL = "https://testproject13.herokuapp.com/auth/linkedin/callback"

module.exports = {
	'linkedinAuth' : {
		'clientID': '86n3g8iavbqka8',
		'clientSecret': 'zXUnpDmzEFjfSo5d',
		'callbackURL': URL
	}
}
