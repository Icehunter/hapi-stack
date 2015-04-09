var React = require('react');

var Header = require('../partials/header.jsx');
var Footer = require('../partials/footer.jsx');

var LayoutError = React.createClass({
    render: function() {
        return (
            <html>
                <Header title={this.props.title} />
                <body>
                    <div id="content-error">
                        <span id="message">{this.props.message}</span>
                    </div>
                </body>
            </html>
        );
    }
});

module.exports = LayoutError;
