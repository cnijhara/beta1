import React from 'react';
import {Link} from 'react-router-dom';
import axios from 'axios';

class Mesh extends React.Component {
  
  constructor(props){
    super(props);
    this.state={
      timeLeftHours: 0,
      timeLeftMinutes: 0,
      intervalFunc: {},
      users:[]
    }
    this.intervalFunc = this.intervalFunc.bind(this)
  }
    
  intervalFunc(){ 
    var that = this;
    var rightNow = new Date; 
    if (rightNow.getTime() > this.props.currentMeshEndTimeMilliSec){
      alert("This Mesh Has Expired");
    } else { 
      // console.log('inside update timer')
      var timeDiffInMinutes = (this.props.currentMeshEndTimeMilliSec - rightNow.getTime()) / 60000; 
      var timeLeftHours = Math.floor(timeDiffInMinutes / 60);
      var timeLeftMinutes = Math.floor(timeDiffInMinutes - (timeLeftHours * 60));
      // console.log(timeLeftHours)
      // console.log(timeLeftMinutes)
      this.setState({
        timeLeftHours: timeLeftHours,
        timeLeftMinutes: timeLeftMinutes
      })
      axios.get(`/api/meshUsers/${this.props.currentMeshID}`).then((foundUsers)=>{
        console.log("foundUsers are");
        console.log(foundUsers);
        that.setState({
          users: foundUsers.data
        })
      })
    }
  }

  

  componentDidMount(){ 
    

    this.intervalFunc()
    this.state.intervalFunc = setInterval(this.intervalFunc.bind(this), 6000);

  }

  componentWillUnmount(){
    clearInterval(this.state.intervalFunc);
  }

  componentDidUpdate(){
    // console.log("this.state.users are")
    // console.log(this.state.users)
    this.render();
  }

  render() {
    var that = this;

    
      return (
        <div className="container"> 
          <h1> You are at Mesh {this.props.currentMeshName}</h1>
          <h2> {
              function(){
                var convertedTimeLeftMinutes = that.state.timeLeftMinutes;
                if (that.state.timeLeftMinutes === 0) convertedTimeLeftMinutes = "less than 1"
                return `This Mesh has ${that.state.timeLeftHours} hours and ${convertedTimeLeftMinutes} minutes left`
              }()
          }</h2>
          <div className="row" id="yourself">
            <div className="col-xs-6">
              <img src={this.props.photo} className='avatar-pic'/>
            </div>
            <div className="col-xs-6">
              <h6>{this.props.username}</h6>
              <h6>{this.props.job}</h6> 
            </div>
          </div> 
          <br/><hr/><br/>
          <div id='others'>
            {
                this.state.users.filter(v => (v.fullName !==that.props.userFullName))
                  .map((v, i) => {
                    return (
                      <div className="row other-users" id={v.fullName} key={i}>
                        <div className="col-xs-4">
                          <img src={v.photo} className='avatar-pic'/>
                        </div>
                        <div className="col-xs-2">
                          <a href={v.linkedinURL} target="_blank">
                            <img src="/assets/images/Linkedin.png" className='linkedin-pic img img-responsive'/>
                          </a> 
                        </div>
                        <div className="col-xs-6">
                          <h6>{v.firstName}</h6>
                          <h6>{v.job}</h6> 
                        </div>
                      </div> 
                    )
                })
            }
          </div>
          <Link to="/">
            <button className="btn btn-success">Back to homepage</button>
          </Link>
        </div>

      )
    
  }
}

export default Mesh;
