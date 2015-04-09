var React = require('react');
var LayoutError = require('../layouts/layout_error.jsx');

var Error = React.createClass({
    render: function() {
        return (
            <LayoutError title={this.props.title} message={this.props.message} />
        );
    }
});

module.exports = Error;
