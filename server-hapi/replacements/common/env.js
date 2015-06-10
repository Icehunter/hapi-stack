'use strict';

module.exports = [{
    regex: 'R_DEBUG',
    replace: false
}, {
    regex: 'R_SERVERS',
    replace: JSON.stringify([{
        key: '@icehunter/hapi-api',
        host: '127.0.0.1',
        domain: '127.0.0.1',
        port: 8000,
        https: false,
        certificatesPath: '/opt/hapi-stack/certificates',
        config: {}
    }, {
        key: '@icehunter/hapi-client',
        host: '127.0.0.1',
        domain: '127.0.0.1',
        port: 3000,
        https: false,
        certificatesPath: '/opt/hapi-stack/certificates',
        config: {}
    }, {
        key: '@icehunter/hapi-socketio',
        host: '127.0.0.1',
        domain: '127.0.0.1',
        port: 4000,
        https: false,
        certificatesPath: '/opt/hapi-stack/certificates',
        config: {}
    }])
}, {
    regex: 'R_PLUGINS',
    replace: JSON.stringify([
        '@icehunter/hapi-logging',
        '@icehunter/hapi-cors'
    ])
}];
