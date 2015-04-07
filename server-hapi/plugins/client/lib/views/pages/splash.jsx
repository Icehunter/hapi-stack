var React = require('react');
var Layout = require('../layouts/layout.jsx');

var Splash = React.createClass({
    render: function() {
        return (
            <Layout title={this.props.title}>
                <div><h1>Hello REACT</h1></div>
            </Layout>
        );
    }
});

module.exports = Splash;
