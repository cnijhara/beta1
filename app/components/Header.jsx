import React from 'react';
import {Link, Route} from 'react-router-dom';

class Header extends React.Component {
  constructor(props){
    super(props);
  }
  render() {
    return (

        <div className="row header">
          <nav className="navbar-toggleable-md navbar-light">
            <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
              <div className="navbar">
                
                <Link className="navbar_brand" to="/">
                  Back to home
                </Link>
              </div>
            </div>
          </nav>
        </div>
    )}
}

export default Header;