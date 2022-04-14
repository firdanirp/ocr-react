import './App.css';
import React from 'react';
// import { RadioGroup, RadioButton } from 'react-radio-buttons';
// import ImageUploader from 'react-images-upload';
import ReactiveButton from 'reactive-button'; 
import Axios from 'axios';
import FileReader from 'react-file-reader'; 
import DataTable from 'react-data-table-component';
import DataTableExtensions from 'react-data-table-component-extensions';
import 'react-data-table-component-extensions/dist/index.css';
// import {ExportToCsv} from 'export-to-csv';

class Upload extends React.Component{
    constructor(props){
        super(props);
        this.state = {
          first:undefined,
          showUploader:null,
          uploadState:'idle',
          dataResponse:[],

          second:false,
          btn:undefined,
          rad:undefined,
          file:undefined,
          status:undefined,
          pdfUrl:undefined
        }

        this.updateTypeFile = this.updateTypeFile.bind(this);
        this.updateUploadState = this.updateUploadState.bind(this);
        this.updateData = this.updateData.bind(this);
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

      render(){
          return(
              <div>
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
        // console.log(this.props.dataResponse);
    
        const columns = [
            {name: 'Sold to Party',selector: row=>row['Sold-to-party']},
            {name: 'Ship to Party',selector: row=>row['Ship-to-party']},
            {name: 'Customer Reference',selector: row=>row['CustReference']},
            {name: 'Request Delivery Date',selector: row=>row['ReqDelivDate']},
            {name: 'Document Date',selector: row=>row['DocDate']},
            {name: 'Pricing Date',selector: row=>row['PricingDate']},
            {name: 'Shipping Type',selector: row=>row['ShippingType']},
            {name: 'Customer Material Number',selector: row=>row['CustomerMaterialNumb']},
            {name: 'Order Quantity',selector: row=>row['OrderQuantity']}
          ];
        const response=this.props.dataResponse;
        const data = Object.values(response);
        this.tableData = {
            columns,
            data,
          };

    }

    render(){
        return(
            <div style={{textAlign: "center", margin:'30px'}}>
                <DataTableExtensions
                    {...this.tableData}
                >
                    <DataTable
                        columns={this.columns}
                        data={this.data}
                        exportHeaders={true}
                        defaultSortAsc={false}
                        highlightOnHover
                        noHeader
                        filter={false}
                    />
                </DataTableExtensions>
            </div>
        );
    }
}


export default Upload;