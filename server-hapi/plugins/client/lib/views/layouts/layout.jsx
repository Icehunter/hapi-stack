var React = require('react');

var Header = require('../partials/header.jsx');
var Footer = require('../partials/footer.jsx');

var DefaultLayout = React.createClass({
    render: function() {
        return (
            <html>
                <Header title={this.props.title} />
                <body>
                    {this.props.children}
                    <Footer />
                </body>
            </html>
        );
    }
});

module.exports = DefaultLayout;
