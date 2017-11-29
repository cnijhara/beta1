import React from "react";
import axios from 'axios';
import {Link} from 'react-router-dom';
import history from '../../history.js';
import { Button, Modal } from 'react-bootstrap';

class LoginOrStart extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      showModal1: false,
      showModal2 : false,
      redirectMeshID: "",
      redirectMeshName: "",
      redirectMeshEndTimeMilliSec: ""

    }
    this.close1 = this.close1.bind(this);
    this.open1 = this.open1.bind(this);
    this.close2 = this.close2.bind(this);
    this.open2 = this.open2.bind(this);
  }

  close1() {
    this.setState({ showModal1: false });
  }

  open1() {
    this.setState({ showModal1: true });
  } 
  close2() {
    this.setState({ showModal2: false });
  }

  open2(meshID, meshName, meshEndTimeMilliSec) {
    this.setState({ 
      showModal2: true,
      redirectMeshID: meshID,
      redirectMeshName: meshName,
      redirectMeshEndTimeMilliSec: meshEndTimeMilliSec
    })
  } 

  componentDidMount(){
    var that = this; 
    if (!this.props.username){
      axios.get('/api/loggedin').then((logincheck) =>{
        console.log('/api/loggedin returns')
        console.log('tempID is ', logincheck.data.tempID)
        that.props.updateLogin(logincheck)
        //check database
        axios.get(`/api/user/${logincheck.data.tempID}`).then((foundUserObj) => {
          console.log('/api/user returns')
          // console.log('foundUserObj received', foundUserObj)
          var redirectPath = foundUserObj.data.redirectAction; 
          console.log('redirect path is')
          console.log(redirectPath)
          if(foundUserObj.data.user) {
            console.log('react trying to update user')
            that.props.updateUser(foundUserObj.data.user)
          }
          if (foundUserObj.data.needToRedirect){
              axios.post(`/api/turnOffRedirect/${logincheck.data.tempID}`).then(()=>{
                console.log('TURNING OFF REDIRECT')
              })
              // console.log(this.props.history)
              if (redirectPath !== 'form'){
                var meshRedirectName = foundUserObj.data.meshName;
                var meshRedirectEndTime = foundUserObj.data.meshEndTimeMilliSec;
                that.props.joinCurrentMesh(redirectPath.slice(5), meshRedirectName, meshRedirectEndTime);
              }
              console.log('REDIRECTING')
              history.replace({ pathname: `/${redirectPath}` })
          //history.push
          }
          else that.render();
        })
      })
    }
  }
  
  geolocate(){
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var geolocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        var circle = new google.maps.Circle({
          center: geolocation,
          radius: position.coords.accuracy
        });
        autocomplete.setBounds(circle.getBounds());
      });
    }
  }

  render(props) {
    var welcomeUser ='';
    var that = this;  
    if (this.props.userLogged === false && this.props.serverResponded === true) {
      welcomeUser = `User ${this.props.tempID}`; 
      var content = (
        <div className="container card text-center login">
          <div className="card-block">
              <h1 className="card-title">Welcome to Circle-Mesh, {welcomeUser}</h1>
              <br />

              <div className='panel'>
                <div className='panel-heading'>
                  <h5>Nearby Active Meshes</h5>
                </div>
                <div className='panel-body'>
                  {
                    this.props.meshes.map(
                    function(mesh, i){
                      return(
                        <Button
                          bsStyle="primary"
                          bsSize="large"
                          onClick={that.open2.bind(that, mesh._id, mesh.meshName, mesh.meshEndTimeMilliSec)}
                          key={i}
                        >
                         Join Mesh {mesh.meshName}(login)
                        </Button>
                      )
                    })
                  }
                <Modal show={this.state.showModal2} onHide={this.close2}>
                <Modal.Header closeButton>
                  <Modal.Title>Terms and Agreement</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  Some terms and agreement
                  </Modal.Body>
                <Modal.Footer>
                  <a 
                  href={`auth/linkedin/mesh/${this.props.tempID}/${this.state.redirectMeshID}/${this.state.redirectMeshName}/${this.state.redirectMeshEndTimeMilliSec}`} 
                  className="btn btn-success">
                    Agree
                  </a>
                </Modal.Footer>
              </Modal>

                </div>
              </div>

              <h4 className="card-text">Log in with Linkedin</h4>
              <br/>
              
              <Button
                bsStyle="primary"
                bsSize="large"
                onClick={this.open1}
              >
                Create Mesh (login)
              </Button>
              
              <Modal show={this.state.showModal1} onHide={this.close1}>
                <Modal.Header closeButton>
                  <Modal.Title>Terms and Agreement</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  Some terms and agreement
                  </Modal.Body>
                <Modal.Footer>
                  <a 
                  href={`auth/linkedin/create/${this.props.tempID}`} 
                  className="btn btn-primary">
                    Agree
                  </a>
                </Modal.Footer>
              </Modal>
          </div>
        </div>
      )
    } else if (this.props.userLogged === true && this.props.serverResponded === true){
      welcomeUser = `${this.props.username}`; 
      var content = (
        <div className="container card text-center login">
          <div className="card-block">
              <h1 className="card-title">Welcome to Circle-Mesh, {welcomeUser}</h1>
              <br />

              <div className='panel'>
                <div className='panel-heading'>
                  <h5>Nearby Active Meshes</h5>
                </div>
                <div className='panel-body'>
                  {this.props.meshes.map(
                    function(mesh, i){
                      return(
                        <div key={i} onClick={that.props.joinCurrentMesh.bind(that,mesh._id, mesh.meshName, mesh.meshEndTimeMilliSec)}>
                          <p className="btn btn-success">Join {mesh.meshName}</p>
                        </div>
                      )
                    })
                  }
                </div>
              </div>

              <h4 className="card-text">Create or Join a mesh</h4>
              <br/>

              <Link to="/form" className="btn btn-success create_btn">Create a Mesh</Link>

          </div>
        </div>
      )
    } else {
      var content = (<h3>Waiting for server ...</h3>)
    }
  	return (
      <div>
        {content}
      </div>
  	)
  }
}

export default LoginOrStart;