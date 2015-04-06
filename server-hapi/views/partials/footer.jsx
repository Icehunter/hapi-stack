var React = require('react');

var Footer = React.createClass({
    render: function() {
        return (
            <div id="{this.props.name}">FOOTER</div>
        );
    }
});

module.exports = Footer;
