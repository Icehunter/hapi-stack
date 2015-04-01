'use strict';

module.exports = function (server) {
    return [{
        provider: 'twitter',
        password: 'password',
        isSecure: false, // Terrible idea but required if not using HTTPS
        // Make sure to set a "Callback URL" and
        // check the "Allow this application to be used to Sign in with Twitter"
        // on the "Settings" tab in your Twitter application
        clientId: '', // Set client id
        clientSecret: '' // Set client secret
    }, {
        provider: 'google',
        password: 'password',
        isSecure: false, // Terrible idea but required if not using HTTPS
        // You'll need to go to https://console.developers.google.com and set up an application to get started
        // Once you create your app, fill out "APIs & auth >> Consent screen" and make sure to set the email field
        // Next, go to "APIs & auth >> Credentials and Create new Client ID
        // Select "web application" and set "AUTHORIZED JAVASCRIPT ORIGINS" and "AUTHORIZED REDIRECT URIS"
        // This will net you the clientId and the clientSecret needed.
        // Also be sure to pass the redirect_uri as well. It must be in the list of "AUTHORIZED REDIRECT URIS"
        clientId: '',
        clientSecret: '',
        providerParams: {
            redirect_uri: server.info.uri + '/login/google'
        }
    }];
};
