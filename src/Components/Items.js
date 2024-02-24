import React, { Component } from 'react'
import Itempic from './itempic';
import './stylesheetforpro.css'
class items extends Component{
   render(){
    return (
    <div className='itemgrid'>
        
        {this.props.projects.map((itempi,index) =><Itempic key={index} itempi={itempi} email={this.props.email} />)}
      
    </div>
  )
}}

export default items
