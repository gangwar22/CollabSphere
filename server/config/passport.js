const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ email: profile.emails[0].value });

            if (user) {
                if (user.provider === 'local') {
                    user.provider = 'google';
                    user.providerId = profile.id;
                    await user.save();
                }
                return done(null, user);
            }

            user = await User.create({
                name: profile.displayName,
                email: profile.emails[0].value,
                provider: 'google',
                providerId: profile.id,
                isAdmin: false
            });
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    }));
} else {
    console.warn('Google OAuth strategy not initialized: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing in .env');
}

// GitHub Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "/api/auth/github/callback",
        scope: ['user:email']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.username}@github.com`;
            let user = await User.findOne({ email });

            if (user) {
                if (user.provider === 'local') {
                    user.provider = 'github';
                    user.providerId = profile.id;
                    await user.save();
                }
                return done(null, user);
            }

            user = await User.create({
                name: profile.displayName || profile.username,
                email,
                provider: 'github',
                providerId: profile.id,
                isAdmin: false
            });
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    }));
} else {
    console.warn('GitHub OAuth strategy not initialized: GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET missing in .env');
}
