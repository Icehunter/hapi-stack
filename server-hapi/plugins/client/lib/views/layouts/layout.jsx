var React = require('react');

var Header = require('../partials/header.jsx');
var Footer = require('../partials/footer.jsx');

var DefaultLayout = React.createClass({
    render: function() {
        return (
            <html>
                <Header title={this.props.title} />
                <body>
                    <div id="content">{this.props.children}</div>
                    <Footer />
                </body>
            </html>
        );
    }
});

module.exports = DefaultLayout;
