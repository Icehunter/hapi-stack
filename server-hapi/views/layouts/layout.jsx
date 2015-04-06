var React = require('react');

var Footer = require('../partials/footer.jsx');

var DefaultLayout = React.createClass({
    render: function() {
        return (
            <html>
                <title>{this.props.title}</title>
                <meta charset="utf-8"/>
                <meta content="IE=edge,chrome=1" http-equiv="X-UA-Compatible"/>
                <meta content="Ryan Wilson" name="author"/>
                <meta content="width=device-width" name="viewport"/>
                <base target="_self"/>
                <link href="/favicon.ico" rel="shortcut icon" type="image/x-icon"/>
                <body>
                    {this.props.children}
                    <Footer />
                </body>
            </html>
        );
    }
});

module.exports = DefaultLayout;
