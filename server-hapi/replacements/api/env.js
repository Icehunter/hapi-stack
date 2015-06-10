'use strict';

module.exports = [{
    regex: 'R_SERVERS',
    replace: JSON.stringify([{
        key: '@icehunter/hapi-client',
        version: '^1.0.0',
        host: '127.0.0.1',
        domain: '127.0.0.1',
        port: 3000,
        https: false,
        certificatesPath: '/opt/hapi-stack/certificates',
        config: {}
    }])
}];
