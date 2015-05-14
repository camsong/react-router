var React = require('react');
var HashHistory = require('react-router/HashHistory');
var { createRouter, State, Navigation, Route, Link } = require('react-router');
var auth = require('./auth');

function requireAuth(Component) {
  return React.createClass({
    statics: {
      routerWillEnter(router, state) {
        if (!auth.loggedIn())
          router.replaceWith('login', null, { nextPath: state.location.path });
      }
    },
    render() {
      return <Component {...this.props}/>
    }
  });
}

var Dashboard = requireAuth(
  React.createClass({
    render() {
      var token = auth.getToken();
      return (
        <div>
          <h1>Dashboard</h1>
          <p>You made it!</p>
          <p>{token}</p>
        </div>
      );
    }
  })
);

var Login = React.createClass({
  mixins: [ State, Navigation ],
  getInitialState() {
    return {
      error: false
    };
  },
  handleSubmit(event) {
    event.preventDefault();

    var nextPath = this.getQuery().nextPath;
    var email = this.refs.email.getDOMNode().value;
    var pass = this.refs.pass.getDOMNode().value;

    auth.login(email, pass, (loggedIn) => {
      if (!loggedIn)
        return this.setState({ error: true });

      if (nextPath) {
        this.replaceWith(nextPath);
      } else {
        this.replaceWith('/about');
      }
    });
  },
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label><input ref="email" placeholder="email" defaultValue="joe@example.com"/></label>
        <label><input ref="pass" placeholder="password"/></label> (hint: password1)<br/>
        <button type="submit">login</button>
        {this.state.error && (
          <p>Bad login information</p>
        )}
      </form>
    );
  }
});

var About = React.createClass({
  render() {
    return <h1>About</h1>;
  }
});

var Logout = React.createClass({
  componentDidMount() {
    auth.logout();
  },
  render() {
    return <p>You are now logged out</p>;
  }
});

var App = React.createClass({
  getInitialState() {
    return {
      loggedIn: auth.loggedIn()
    };
  },
  handleAuthChange(loggedIn) {
    this.setState({
      loggedIn
    });
  },
  componentWillMount() {
    auth.onChange = this.handleAuthChange;
    auth.login();
  },
  render() {
    return (
      <div>
        <ul>
          <li>
            {this.state.loggedIn ? (
              <Link to="logout">Log out</Link>
            ) : (
              <Link to="login">Sign in</Link>
            )}
          </li>
          <li><Link to="about">About</Link></li>
          <li><Link to="dashboard">Dashboard</Link> (authenticated)</li>
        </ul>
        {this.props.children}
      </div>
    );
  }
});

var Router = createRouter(
  <Route component={App}>
    <Route name="login" component={Login}/>
    <Route name="logout" component={Logout}/>
    <Route name="about" component={About}/>
    <Route name="dashboard" component={Dashboard}/>
  </Route>
);

React.render(
  <Router history={HashHistory}/>,
  document.getElementById('example')
);
