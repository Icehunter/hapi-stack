var React = require('react');

var Header = React.createClass({
    render: function() {
        return (
            <head>
                <title>{this.props.title}</title>
                <meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no, width=device-width" />
                <meta content="Ryan Wilson" name="author" />
                <meta content="width=device-width" name="viewport" />
                <base target="_self" />
                <link href="/favicon.ico" rel="shortcut icon" type="image/x-icon" />
                <link href="/css/style.css" rel="stylesheet" />
            </head>
        );
    }
});

module.exports = Header;
