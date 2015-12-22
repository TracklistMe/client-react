import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import DocumentMeta from 'react-document-meta';
import { logout, loadAuthCookie, loadPersonalInfo } from 'redux/modules/auth';
import { load as loadGenre } from 'redux/modules/genre';

import { pushState } from 'redux-router';
import PlayerContainer from '../PlayerContainer/PlayerContainer';


const title = 'TracklistMe';
const description = 'All the modern best practices in one example.';
const image = 'https://react-redux.herokuapp.com/logo.jpg';
const logo = require('./../../img/logoAphextwin.png');


const meta = {
  title,
  description,
  meta: {
    charSet: 'utf-8',
    property: {
      'og:site_name': title,
      'og:image': image,
      'og:locale': 'en_US',
      'og:title': title,
      'og:description': description,
      'twitter:card': 'summary',
      'twitter:site': '@tracklistme',
      'twitter:creator': '@tracklistme',
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': image,
      'twitter:image:width': '200',
      'twitter:image:height': '200'
    }
  }
};

const NavbarLink = ({to, children}) => (
  <Link key={to} to={to}>
  {children}
  </Link>
);

@connect(
  state => ({user: state.auth.user, selectGenre: state.genre.selectGenre, genres: state.genre.genres, logged: state.auth.logged}),
  {logout, loadGenre, loadPersonalInfo, loadAuthCookie, pushState})

export default class App extends Component {
  static propTypes = {
    children: PropTypes.object.isRequired,
    user: PropTypes.object,
    genres: PropTypes.array,
    selectGenre: PropTypes.object,
    logged: PropTypes.bool.isRequired,
    logout: PropTypes.func.isRequired,
    loadAuthCookie: PropTypes.func.isRequired,
    loadPersonalInfo: PropTypes.func.isRequired,
    loadGenre: PropTypes.func.isRequired,
    pushState: PropTypes.func.isRequired
  };

  static contextTypes = {
    store: PropTypes.object.isRequired
  };

  componentWillMount() {
    // Load overall informations.
    this.props.loadGenre();

    // Authentication
    this.props.loadAuthCookie();
    if (this.props.logged) {
      this.props.loadPersonalInfo();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.logged && nextProps.logged) {
      // login, readback the query.next and redirect accorderly.
      this.props.loadPersonalInfo();
      // process to change the route.
      const redirectRoute = nextProps.location.query.next || '/me';
      this.props.pushState(null, redirectRoute);
    } else if (this.props.logged && !nextProps.logged) {
      // logout
      this.props.pushState(null, '/beta');
    }
  }

  handleLogout(event) {
    event.preventDefault();
    this.props.logout();
  }

  render() {
    const {user, logged, genres} = this.props;
    const styles = require('./less/aphextwin.less');
    return (
      <div className={styles}>
      <DocumentMeta {...meta}/>
      <nav className="navbar navbar-default navbar-fixed-top" role="navigation">
        <div className="navbar-background"> </div>
        <div className="navbar-header">
        <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
          <span className="sr-only">Toggle navigation</span>
          <span className="icon-bar"></span>
          <span className="icon-bar"></span>
          <span className="icon-bar"></span>
        </button>
        <ul className="nav navbar-nav">
          <li className="dropdownBackground dropdownBorder">
          <Link to="/beta"> <img src={logo} /></Link>
          <ul>
            <li><NavbarLink to="/track/77">Go to track 77</NavbarLink></li>
            <li><NavbarLink to="/track/80">Go to track 80</NavbarLink></li>
            <li><NavbarLink to="/release/257">Go to release 257</NavbarLink></li>
            <li><NavbarLink to="/tracklist/77">Tracklist</NavbarLink></li>
            <li><a href="#">Labels</a></li>
          </ul>
          </li>
        </ul>
        </div>
        <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
        <ul className="nav navbar-nav">
          <li className="divider-vertical"></li>
          <li className="dropdownBackground dropdownBorder">
          <a href="#">{this.props.selectGenre && this.props.selectGenre.name || 'Genres'}
          <span className="pull-right basic-pictosimply-down icon"></span></a>
          <ul>
            {genres && genres.map((genre) =>
              <li>
                <NavbarLink key={genre.id} to={'/genre/' + genre.id}>{genre.name}</NavbarLink>
              </li>
            )}
            <li><a href="#">Techno</a></li>
            <li><a href="#">House</a></li>
            {user && <li><Link to="/chat">Chat</Link></li>}

            <li><Link to="/widgets">Widgets</Link></li>
            <li><Link to="/survey">Survey</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/me">User Page</Link></li>
          </ul>
          </li>
          <li className="divider-vertical"></li>
          <li>
          <search_component>
            <span className="basic-pictosearch icon"></span>
            <input type="search" id="search" placeholder="Search..." />
          </search_component>
          </li>
        </ul>
        <ul className="nav navbar-nav navbar-right">
          <li className="divider-vertical"></li>
          <li className="navbar-text">
             <icon className="basic-pictohead icon"></icon>
              {!logged && <span><NavbarLink to="/login">Login</NavbarLink> or Register</span>}
              {logged && <span><a onClick={::this.handleLogout}>Logout</a></span>}
          </li>
          <li className="divider-vertical"></li>
          <li ><a href="#"><span className="basic-pictoshop icon"></span>2</a></li>
        </ul>
        </div>
      </nav>
      <div className={styles.appContent}>
        {this.props.children}
      </div>
      <footer className="row darkestrow">
        <div className="pull-right col-xs-4 col-sm-4col-md-4 col-lg-4">
        <a href="#"><img src={logo} /></a>
        <p>2014 - 2016</p>
        </div>
      </footer>
      <PlayerContainer />
      </div>
    );
  }
}
