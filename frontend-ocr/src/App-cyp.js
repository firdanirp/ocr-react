import React from 'react';
// import { RadioGroup, RadioButton } from 'react-radio-buttons';
// import ImageUploader from 'react-images-upload';
import ReactiveButton from 'reactive-button'; 
import Axios from 'axios';
import FileReader from 'react-file-reader'; 

import { AgGridReact, AgGridColumn } from '@ag-grid-community/react';
import { CsvExportModule } from "@ag-grid-community/csv-export";
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-alpine.css'; 
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

// Register the required feature modules with the Grid FOR TABLE
ModuleRegistry.registerModules([ClientSideRowModelModule,CsvExportModule])

class Upload extends React.Component{
    constructor(props){
        super(props);
        this.state = {
          first:undefined,
          showUploader:null,
          uploadState:'idle',
          dataResponse:[],
          fileName:''
        }

        this.updateTypeFile = this.updateTypeFile.bind(this);
        this.updateUploadState = this.updateUploadState.bind(this);
        this.updateData = this.updateData.bind(this);
        this.updateFileName = this.updateFileName.bind(this);
      }

      updateTypeFile(first){
        this.setState({
          first:first
        });
      }

      updateUploadState(arg){
        this.setState({
            uploadState:arg
        });
      }

      updateData(data){
        //   console.log(data);
          this.setState({
              dataResponse:data
          });
      }

      updateFileName(name){
        this.setState({
          fileName:name
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
                    updateData={this.updateData}
                    updateFileName={this.updateFileName}/>}
                {this.state.uploadState === 'success' && 
                  <Table 
                    dataResponse={this.state.dataResponse} 
                    fileName={this.state.fileName}/>}
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
        const fileName = files.fileList['0'].name;
        this.props.updateFileName(fileName);
        data64 = data64.substr(data64.indexOf(',')+1)
        // URL FOR CYP COMPANY ->LAMBDA PDF HANDLER
        const response = await Axios.put('https://nlcvy73ry2.execute-api.us-west-2.amazonaws.com/dev',  {
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
        console.log(this.props.fileName);
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
            // pagination:true,
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
      let name = this.props.fileName;
      const nameSplit = name.split('.');
      const file = nameSplit[0];
      console.log(file);
      const params = {
        fileName:file
      }
      this.state.gridApi.exportDataAsCsv(params);
    }

    render(){
        return(
            <div className="ag-theme-alpine" style={{height:250, width:'70%', position:'absolute', left:'14%'} }>
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
              <div style={{textAlign:'center'}}>
                <ReactiveButton 
                  onClick={this.clickExport}
                  idleText='Export to CSV'/>
              </div>      
            </div>
        );
    }
}


export default Upload;