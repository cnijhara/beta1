import React from 'react';
import axios from 'axios';
import history from '../history.js';

import { Route, BrowserRouter, Switch } from "react-router-dom";
import LoginOrStart from './children/LoginOrStart.jsx';
import Form from './children/Form.jsx';
import Mesh from './children/Mesh.jsx';

class Routes extends React.Component {
  constructor(props){
    super(props)
    this.state= {
      userLogged: false,
      serverResponded: false,
      tempID: 0,
      username: '',
      fullName: '',
      job: '',
      photo: '',
      linkedinURL: '',  
      meshes:[],
      currentMeshID: '',
      currentMeshName: '',
      currentCoordinate: {lng: 0, lat: 0},
      currentMeshEndTimeMilliSec: 0,
      userLat: 0,
      userLng: 0,
      autocomplete: null
    }
    this.updateLogin = this.updateLogin.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.createMesh = this.createMesh.bind(this);
    this.joinCurrentMesh = this.joinCurrentMesh.bind(this);
    this.getAllMeshes = this.getAllMeshes.bind(this);
    this.setAutocomplete = this.setAutocomplete.bind(this);
  }

  updateLogin(logincheck){
    var that = this;
    that.setState({
      serverResponded: true,
      userLogged: logincheck.data.logged,
      tempID: logincheck.data.tempID
    })
    console.log('updated routesR\'s login states')
  }

  updateUser(foundUser){
    var that = this;
    that.setState({
      username: foundUser.firstName,
      photo: foundUser.photo,
      job: foundUser.job,
      fullName: foundUser.fullName,
      linkedinURL: foundUser.linkedinURL
    })
    console.log('updated routesR\'s user & mesh states');
    console.log('foundUser', foundUser.firstName)
  }


  createMesh(meshObj){
    var that = this;  
    axios.post('/api/mesh', meshObj).then((data)=>{
      console.log('created a new mesh');
      that.getAllMeshes();
    })
  }

  joinCurrentMesh(meshID, meshName, meshEndTimeMilliSec){
    var that = this;  
    console.log('trying to join mesh');
    console.log("currentMeshID is", meshID);
    console.log("currentMeshName is", meshName);
    console.log("currentMeshEndTimeMilliSec is", meshEndTimeMilliSec);
    this.setState({
      currentMeshID:meshID,
      currentMeshName: meshName, 
      currentMeshEndTimeMilliSec: meshEndTimeMilliSec
    });
    axios.post(`/api/joinMesh/${meshID}`).then((data)=>{
      console.log('database joining success');
      history.push({ pathname: `/mesh/${meshID}` });

    })
    //TODO: add this user to mesh via Mongoose
  }

  getAllMeshes(){
    var that = this;  
    axios.get('/api/meshes').then((meshesObj)=>{
        console.log('meshesObj.data is');
        console.log(meshesObj.data);
        console.log("that.state.userLat" + that.state.userLat);
        console.log("that.state.userLng" + that.state.userLng);
      if (Object.keys(meshesObj.data).length){
        var filteredMeshes = meshesObj.data.filter((v)=>{
          var R = 6371e3; 
          var lat1 =  v.meshCoordinate.lat;
          var lon1 =  v.meshCoordinate.lng;
          var lat2 = that.state.userLat;
          var lon2 = that.state.userLng;
          var φ1 = (lat1)/180*Math.PI;
          var φ2 = (lat2)/180*Math.PI;
          var Δφ = (lat2-lat1)/180*Math.PI;
          var Δλ = (lon2-lon1)/180*Math.PI;

          var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
          var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

          var d = R * c;
          // return d < 1609;
          return d < 5000; // Inside 5 km
        });
        console.log("filteredMeshes are" + filteredMeshes);
        that.setState({meshes: filteredMeshes});
      }
    })
  }
  componentDidMount(){
    var that = this; 
    navigator.permissions.query({name:'geolocation'})
    .then(function(permissionStatus) {  
      console.log('geolocation permission state is ', permissionStatus.state);
      if (permissionStatus.state !== 'granted'){
        Notification.requestPermission(function(result) {
          console.log(`New permission result is ${result}`)
        })
      }
      permissionStatus.onchange = function() {  
        console.log('geolocation permission state has changed to ', this.state);
      };
      that.googleInit();
    });

    setInterval(function(){
      that.googleInit();
      console.log(that.state.meshes);
    },60000);
    setInterval(function(){
      that.getAllMeshes();
    },6000);

  }

  setAutocomplete (obj){
    this.setState({autocomplete: obj})
    console.log('trying to set autocomplete')
  }

  googleInit(){
    var that = this;  
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          var pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          console.log("lat is", pos.lat);
          console.log("lng is", pos.lng);
          that.setState({
            userLat: pos.lat,
            userLng: pos.lng
          })
          var circle = new google.maps.Circle({
              center: pos,
              radius: position.coords.accuracy
            });
            if (that.state.autocomplete){
              // console.log('setting bounds')
              that.state.autocomplete.setBounds(circle.getBounds())
            }
        })
    } else {
      console.log('googleInit not working')
    }
  }

  render(){
    var that = this;  
    return (
      <div>
        <Switch>
          <Route exact path="/"  render={(props) => (
            <LoginOrStart {... props}
              updateLogin={this.updateLogin}
              updateUser={this.updateUser}
              userLogged = {this.state.userLogged}
              serverResponded = {this.state.serverResponded}
              meshes={this.state.meshes}
              tempID={this.state.tempID}
              username={this.state.username}
              currentMesh={this.state.currentMesh}
              joinCurrentMesh={this.joinCurrentMesh}
            />
            
          )}/>

          <Route path="/form" render={(props) => (
            <Form 
              createMesh={this.createMesh}
              currentCoordinate={this.state.currentCoordinate}
              setAutocomplete={this.setAutocomplete}
              autocomplete={this.state.autocomplete}
            />
          )}/>      

          <Route path="/mesh" render={(props) => (
            <Mesh
              username={this.state.username}
              userFullName={this.state.fullName}
              job={this.state.job}
              photo={this.state.photo}
              linkedinURL={this.state.linkedinURL}
              currentMeshID={this.state.currentMeshID}
              currentMeshName={this.state.currentMeshName}
              currentMeshEndTimeMilliSec={this.state.currentMeshEndTimeMilliSec}
            />
          )}/>

        </Switch>
      </div>
    )
  }

}


export default Routes;
