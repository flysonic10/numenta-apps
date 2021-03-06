// Copyright © 2016, Numenta, Inc. Unless you have purchased from
// Numenta, Inc. a separate commercial license for this software code, the
// following terms and conditions apply:
//
// This program is free software: you can redistribute it and/or modify it under
// the terms of the GNU Affero Public License version 3 as published by the
// Free Software Foundation.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
// FOR A PARTICULAR PURPOSE. See the GNU Affero Public License for more details.
//
// You should have received a copy of the GNU Affero Public License along with
// this program. If not, see http://www.gnu.org/licenses.
//
// http://numenta.org/licenses/

import connectToStores from 'fluxible-addons-react/connectToStores';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';
import RaisedButton from 'material-ui/lib/raised-button';
import fs from 'fs';
import React from 'react';
import Table from 'material-ui/lib/table/table';
import TableBody from 'material-ui/lib/table/table-body';
import TableHeader from 'material-ui/lib/table/table-header';
import TableHeaderColumn from 'material-ui/lib/table/table-header-column';
import TableRow from 'material-ui/lib/table/table-row';
import TableRowColumn from 'material-ui/lib/table/table-row-column';
import TextField from 'material-ui/lib/text-field';
import Colors from 'material-ui/lib/styles/colors';

import FileDetailsStore from '../stores/FileDetailsStore';
import FileUploadAction from '../actions/FileUpload';
import HideFileDetailsAction from '../actions/HideFileDetails';

const STYLES = {
  dialog: {
    margin: '1rem'
  },
  button: {
    marginRight: '1rem',
    marginBottom: '1rem'
  },
  error: {
    color: Colors.red500
  },
  container: {
    display: 'flex',
    flex: '1 100%',
    flexDirection: 'column'
  },
  fields: {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: 0,
    flexShrink: 0
  },
  data: {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: 1,
    margin: 'auto',
    border: '1px solid gray'
  },
  tableRow: {
    height: '2rem'
  },
  tableHeader: {
    overflow: 'hidden',
    height: '2rem',
    textOverflow: 'ellipsis'
  },
  tableColumn: {
    overflow: 'hidden',
    height: '2rem',
    textOverflow: 'ellipsis'
  }
};


/**
 * Show file details page. The file must be available from the {@link FileStore}
 */
@connectToStores([FileDetailsStore], (context) => ({
  file: context.getStore(FileDetailsStore).getFile(),
  fields: context.getStore(FileDetailsStore).getFields(),
  error: context.getStore(FileDetailsStore).getError(),
  visible: context.getStore(FileDetailsStore).isVisible(),
  newFile: context.getStore(FileDetailsStore).isNewFile()
}))
export default class FileDetails extends React.Component {

  static contextTypes = {
    executeAction: React.PropTypes.func,
    getStore: React.PropTypes.func,
    getFileClient: React.PropTypes.func,
    muiTheme: React.PropTypes.object
  };

  constructor(props, context) {
    super(props, context);

    this.state = {
      fileSize: 0,
      data: [],
      fields: []
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && nextProps.file) {
      let {file, fields} = nextProps;

      // File size in bytes
      let stats = fs.statSync(file.filename); // eslint-disable-line no-sync
      let fileSize = stats.size;

      // Load first 20 records
      let fileClient = this.context.getFileClient();
      let options = {limit: 20, columns: false, offset: file.rowOffset};
      return new Promise((resolve, reject) => {
        let data = [];
        fileClient.getData(file.filename, options, (error, buffer) => {
          if (error) {
            reject(error, {fileSize, file, fields, data});
          } else if (buffer) {
            let row = JSON.parse(buffer);
            if (fields) {
              data.push(fields.map((field) => row[field.index]));
            } else {
              data.push(row);
            }
          } else {
            // Resolve to data
            resolve(data);
          }
        });
      })
      .catch((error) => this.setState({error, fileSize, fields, data:[]}))
      .then((data) => this.setState({fileSize, fields, data}))
    }
  }

  _onRequestClose() {
    this.context.executeAction(HideFileDetailsAction);
  }

  _onSave() {
    let file = this.props.file;
    if (file) {
      this.context.executeAction(FileUploadAction, file.filename);
    }
    this.context.executeAction(HideFileDetailsAction);
  }

  _renderDataTable() {
    let {fields, data} = this.state;
    if (fields.length > 0  && data.length > 0) {
      let columnHeader;
      let tableRows = [];
      let tableHeight = this.props.error ? 200 : 250;

      columnHeader = fields.map((field) => {
        return (
          <TableHeaderColumn key={field.index} style={STYLES.tableHeader}>
            {field.name}
          </TableHeaderColumn>
        );
      });

      data.forEach((row, rowIdx) => {
        let columns = [];
        Object.values(row).map((value, colIdx) => {
          columns.push(<TableRowColumn key={colIdx}
            style={STYLES.tableColumn}>{value}</TableRowColumn>);
        });
        tableRows.push(<TableRow style={STYLES.tableRow}
          key={rowIdx}>{columns}</TableRow>);
      });

      return (
        <div style={STYLES.data}>
          <Table fixedHeader={true} height={tableHeight.toString()}
              selectable={false}>
            <TableHeader adjustForCheckbox={false} displaySelectAll={false}
                         enableSelectAll={false}>
              <TableRow style={STYLES.tableRow}>
                {columnHeader}
              </TableRow>
            </TableHeader>
            <TableBody stripedRows={true} displayRowCheckbox={false}>
              {tableRows}
            </TableBody>
          </Table>
        </div>
      );
    }
  }

  _renderBody() {
    let file = this.props.file;
    // File Size in KB
    let fileSize = (this.state.fileSize / 1024).toFixed();
    let error;
    if (this.props.error) {
      error =  (<p style={STYLES.error}>{this.props.error}</p>);
    }
    return (
      <div style={STYLES.container}>
        {error}
        <div style={STYLES.fields}>
          <TextField
            floatingLabelText="File Size"
            underlineFocusStyle={{display:'none'}}
            underlineStyle={{display:'none'}}
            readOnly={true}
            tabIndex={-1}
            name="fileSize"
            ref="fileSize"
            value={`${fileSize} KB`}/>
          <TextField
            floatingLabelText="Number of rows"
            name="numOfRows"
            readOnly={true}
            ref="numOfRows"
            tabIndex={-1}
            underlineFocusStyle={{display:'none'}}
            underlineStyle={{display:'none'}}
            value={file.records.toString()}/>
        </div>
        {this._renderDataTable()}
      </div>
    );
  }

  _renderActions() {
    if (this.props.newFile) {
      return [
        <FlatButton label="Cancel"
                    onRequestClose={this._onRequestClose.bind(this)}
                    onTouchTap={this._onRequestClose.bind(this)}/>,

        <RaisedButton label="Add File" primary={true} ref="submit"
                    disabled={this.props.error}
                    style={STYLES.button}
                    onRequestClose={this._onRequestClose.bind(this)}
                    onTouchTap={this._onSave.bind(this)}/>
      ];
    }
    return(<RaisedButton label="Close" primary={true}
                       style={STYLES.button}
                       onRequestClose={this._onRequestClose.bind(this)}
                       onTouchTap={this._onRequestClose.bind(this)}/>);
  }

  render() {
    let body, title;
    let file = this.props.file;
    if (file) {
      title = file.name;
      body = this._renderBody();
    }
    let actions = this._renderActions();
    return (
      <Dialog actions={actions} title={title} open={this.props.visible}
              style={STYLES.dialog}
              onRequestClose={this._onRequestClose.bind(this)}>
        {body}
      </Dialog>
    );
  }
}
