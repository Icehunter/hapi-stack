'use strict';

module.exports = function (server) {
    return [{
        provider: 'twitter',
        password: 'password',
        isSecure: false,
        clientId: '',
        clientSecret: ''
    }, {
        provider: 'google',
        password: 'password',
        isSecure: false,
        clientId: '',
        clientSecret: '',
        providerParams: {
            redirect_uri: server.info.uri + '/login/google'
        }
    }];
};
