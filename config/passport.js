var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
var User = require('../models/User.js');

var passport = function(passport) {
	passport.serializeUser(function(user, done){
    // console.log('serializeUser is being called!')
    // console.log('user obj is')
    // console.log(user)
    done(null, user.id);
	});

  passport.deserializeUser(function(id, done){
    // console.log('deserializeUser is being called!')
    User.findById(id, function(err, user){
			done(null, user);
		});
  });
  
  if (process.env.MONGODB_URI || process.env.PORT){
    var clientID = process.env.linkedin_CLIENT_ID;
    var clientSecret = process.env.linkedin_CLIENT_SECRET;
    var callbackURL = process.env.callback_URL;
  } else {
    var configAuth = require('./auth.js');
    var clientID = configAuth.linkedinAuth.clientID;
	  var clientSecret = configAuth.linkedinAuth.clientSecret;
	  var callbackURL = configAuth.linkedinAuth.callbackURL;

  }

	passport.use(new LinkedInStrategy({
	    clientID: clientID,
	    clientSecret: clientSecret,
      callbackURL: callbackURL,
          scope: ['r_emailaddress', 'r_basicprofile'],
    },
	  function(accessToken, refreshToken, profile, done) {
      // console.log("access", accessToken)
      // console.log("refresh", refreshToken)
      // console.log("profile is", profile)
      process.nextTick(function(){
        // console.log('trying to find user')
        // console.log(`profile displayname is ${profile.displayName}`)
        User.findOne({'fullName': profile.displayName}, function(err, user){
          if(user){
            console.log('user already in database!')
            // console.log(user);
            // user.accessToken = accessToken;
            // user.refreshToken = refreshToken
            // user.save()

            return done(null, user);
          } else {
            console.log('creating a new user in database!');
            // console.log('profile is')
            // console.log(profile)
            User.create({
              'fullName' : profile.displayName,
              'firstName': profile._json.firstName,
              // 'photo': profile.photos[0].value,
              'job': profile._json.headline,
              'linkedinURL': profile._json.siteStandardProfileRequest.url
            }, function(err, data){
              if (err) {
                console.log(err)
              } else {
                console.log('done creating a new user')
                // console.log(data);
                return done(null, data)
              };
            })  
          }     
        })
      })
    }
	));

};


module.exports = passport; 