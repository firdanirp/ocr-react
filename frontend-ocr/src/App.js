import './App.css';
import React from 'react';
import { RadioGroup, RadioButton } from 'react-radio-buttons';
import ImageUploader from 'react-images-upload';
import ReactiveButton from 'reactive-button'; 
import Axios from 'axios';
import StatusAlert, { StatusAlertService } from 'react-status-alert';
import 'react-status-alert/dist/status-alert.css'

class Upload extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      first:false,
      second:false,
      btn:undefined,
      rad:undefined,
      file:undefined,
      status:undefined
    }
  }

  render(){
    return(
    <div style={{textAlign: "center", margin:'30px'}}>
      <ReactiveButton
        onClick={()=>{this.setState({btn:'Single'}); this.setState({first:true})}}
        idleText='Single Image'
        color='yellow'
        width='200px'
        style={{marginRight:20}}
      />
      <ReactiveButton 
        onClick={()=>{this.setState({btn:'Multiple'}); this.setState({first:true})}}
        idleText='Multiple Image'
        color='blue'
        width='200px'
      />
      {this.state.first === true && this.state.btn !== undefined && this.radView(this.state.btn) }
      {this.state.first === true && this.state.second === true && this.fileUpload({second:this.state.second, btn:this.state.btn}) } 
    </div>
    );
  }

  radView(props){
    return (
      <div>
        <p>{props} Image Selected</p>
        <RadioGroup horizontal onChange={(event)=>{this.setState({rad:event}); this.setState({second:true})}} > 
          <RadioButton value="Form" style={{borderRadius:"30%"}}>Form</RadioButton>
          <RadioButton value="Table">Table</RadioButton>
          <RadioButton value="Invoice">Invoice</RadioButton>
        </RadioGroup>
      </div>
    );
  }

  fileUpload(props){
    const isSingle = (btn) =>{
      return btn === 'Single' ? true : false;
    }

    return (
      <div>
        <ImageUploader
          key='image-uploader'
          withIcon={true}
          singleImage={isSingle(props.btn)} 
          withPreview={true}
          label="Maximum size file: 5MB"
          buttonText='Choose an image'
          onChange={(event)=>{this.setState({file:event[0]});}}
          imgExtension={['.jpeg','.jpg']}
          maxFileSize={5242880}></ImageUploader>
        <ReactiveButton
          buttonState='idle'
          color='red'
          rounded={false}
          block={true}
          idleText='Upload'
          onClick={this.uploading({file:this.state.file, rad:this.state.rad})}></ReactiveButton>
      </div>
    );
  }


   async uploading(props){
    try {
      // console.log(props)
      const nameFile = props.file.name; 
      const classify = props.rad;
      const url = 'https://zgohcl9yg8.execute-api.us-west-2.amazonaws.com/dev/images-bucket-ocr/'+classify+'_'+nameFile;
      const res = await Axios.put(url, props.file, {
        headers:{
          'content-type':'image/jpg',
          'accept': '*/*'
        }
      });
      console.log(res);
      // if (res.status === 200){
      //   this.setState({status:'upload successful'});
      // } else {
      //   this.setState({status:res.status});
      // }
    } catch (error) {
      console.log('error in upload', error);
    }
  }
}   

export default Upload;
