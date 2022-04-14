import './App.css';
import React from 'react';
// import { RadioGroup, RadioButton } from 'react-radio-buttons';
// import ImageUploader from 'react-images-upload';
import ReactiveButton from 'reactive-button'; 
import Axios from 'axios';
import FileReader from 'react-file-reader'; 
import { AgGridReact, AgGridColumn } from '@ag-grid-community/react';
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-alpine.css';


class Upload extends React.Component{
    constructor(props){
        super(props);
        this.state = {
          first:undefined,
          showUploader:null,
          uploadState:'idle',
          dataResponse:[]
        }

        this.updateTypeFile = this.updateTypeFile.bind(this);
        this.updateUploadState = this.updateUploadState.bind(this);
        this.updateData = this.updateData.bind(this);
      }

      // in progress purposing option to upload either img/pdf
      updateTypeFile(first){
        this.setState({
          first:first
        });
      }

      // gave button Upload progressing status
      updateUploadState(arg){
        this.setState({
            uploadState:arg
        });
      }

      // receive data response from api gateway 
      updateData(data){
        //   console.log(data);
          this.setState({
              dataResponse:data
          });
      }

      render(){
          return(
              <div style={{textAlign:'center'}}>
                <h1>CYP</h1>
                <TypeFile typeFile={this.updateTypeFile}/>
                {this.state.first === 'pdf' && 
                <PdfUploader 
                    updateUploadState={this.updateUploadState} 
                    uploadState={this.state.uploadState} 
                    updateData={this.updateData}/>}
                {this.state.uploadState === 'success' && <Table dataResponse={this.state.dataResponse}/>}
              </div>
          )
      }
}

class TypeFile extends React.Component{
    constructor(props){
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }
    
    handleClick(e){
        this.props.typeFile(e);
    }

    render(){
        return(
            <div style={{textAlign: "center", margin:'30px'}}>
                {/* <ReactiveButton 
                    onClick={()=>{this.handleClick('img')}}
                    idleText='Image'
                    color='blue'
                    width='200px'
                    value='img'
                />  */}
                <ReactiveButton 
                    onClick={()=>{this.handleClick('pdf')}}
                    idleText='Pdf'
                    color='blue'
                    width='200px'
                    value='pdf'
                />
            </div>
        )
    }
}

class PdfUploader extends React.Component{
    constructor(props){
        super(props);
        this.handleFiles = this.handleFiles.bind(this);

    }

    async handleFiles(files){
        this.props.updateUploadState('loading');
        let data64 = files.base64;
        data64 = data64.substr(data64.indexOf(',')+1)
        // URL FOR CYP COMPANY ->LAMBDA PDF HANDLER
        const response = await Axios.put('https://439elpvibl.execute-api.us-west-2.amazonaws.com/dev',  {
            headers:{
              'Content-Type': 'application/json',
              'filename':files.fileList['0'].name
            },
            body: data64
          });
        
        // console.log(response);
        if (response.data.statusCode === 200) {
            this.props.updateData(response.data.body);
            this.props.updateUploadState('success');
        }
      
    }

    render(){
        return(
            <div style={{textAlign: "center", margin:'30px'}}>
            <FileReader fileTypes={[".pdf"]} handleFiles={this.handleFiles} base64={true} >
               <ReactiveButton 
                color='red' 
                className='btn'
                idleText='Upload'
                buttonState={this.props.uploadState}/>
            </FileReader>
         </div>
        );
    }
}

class Table extends React.Component{
    constructor(props){
        super(props);
        // console.log(this.props.dataResponse);
        const response=this.props.dataResponse;
        const data = Object.values(response);
        // console.log(data);
        
        this.state = {
          gridApi:undefined
        };

        this.state={
          gridOptions:{
            rowData:data,
            columnDefs:[
              { field: "Sold-to-party" },
              { field: "Ship-to-party" },
              { field: "CustReference" },
              { field: "ReqDelivDate" },
              { field: "DocDate" },
              { field: "PricingDate" },
              { field: "ShippingType" },
              { field: "CustomerMaterialNumb" },
              { field: "OrderQuantity" },
            ],
            pagination:true,
            defaultColDef: {editable: true}
          }
        }

        this.onGridReady = this.onGridReady.bind(this);
        this.clickExport = this.clickExport.bind(this);
    }

    onGridReady(params){
      this.setState({gridApi:params.api})
    }

    clickExport(){
      this.state.gridApi.exportDataAsCsv();
    }

    render(){
        return(
            <div className="ag-theme-alpine" style={{position:'absolute', height:250, width:'60%', left:'20%'} }>
              <AgGridReact
                onGridReady={this.onGridReady}
                gridOptions={this.state.gridOptions}
                >
                <AgGridColumn field='Sold-to-party'></AgGridColumn>
                <AgGridColumn field='Ship-to-party'></AgGridColumn>
                <AgGridColumn field='CustReference'></AgGridColumn>
                <AgGridColumn field='ReqDelivDate'></AgGridColumn>
                <AgGridColumn field='DocDate'></AgGridColumn>
                <AgGridColumn field='PricingDate'></AgGridColumn>
                <AgGridColumn field='ShippingType'></AgGridColumn>
                <AgGridColumn field='CustomerMaterialNumb'></AgGridColumn>
                <AgGridColumn field='OrderQuantity'></AgGridColumn>
                
              </AgGridReact> 
              <ReactiveButton 
                onClick={this.clickExport}
                idleText='Export to CSV'/>      
            </div>
        );
    }
}


export default Upload;