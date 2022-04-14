import axios from "axios";
import React from 'react';
import FileReader from 'react-file-reader';

export class App extends React.Component{


    componentDidMount(){
       
        const res = axios.get('https://l2wqr4g440.execute-api.us-west-2.amazonaws.com/dev');
        console.log(res);
    }

    handleFiles = (files) => {

        let data64 = files.base64;
        data64 = data64.substr(data64.indexOf(',')+1)
        // lambda-exp-cors-dani SUCCESS
        // https://nlcvy73ry2.execute-api.us-west-2.amazonaws.com/dev
        // lambda-pdf-handler SUCCESS
        // https://nlcvy73ry2.execute-api.us-west-2.amazonaws.com/dev
        //  https://439elpvibl.execute-api.us-west-2.amazonaws.com/dev

        axios.put('https://439elpvibl.execute-api.us-west-2.amazonaws.com/dev',  {
          headers:{
            'Content-Type': 'application/json',
            'filename':files.fileList['0'].name
          },
          body: data64
        }).then(response=>console.log(response));
      }

    render (){
        return (
        <div>
           <p>TEST</p>
           <FileReader fileTypes={[".pdf",".jpg"]} handleFiles={this.handleFiles} base64={true} >
              <button className='btn'>Upload</button>
           </FileReader>
        </div>
        );
    }  
}

export default App;