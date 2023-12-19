import { StagePanelLocation, StagePanelSection, UiItemsProvider, Widget, WidgetState } from "@itwin/appui-react";
import { IModelApp } from "@itwin/core-frontend";
import { Button, Table, ToggleSwitch } from "@itwin/itwinui-react";
import type { CellProps, Column,  } from 'react-table';
import React, { useEffect, useState, DragEvent } from "react";
import { convertXmlToEcSQL } from "../utils/IDSToecSQL";
import { _executeQuery } from "../helperFunctions/query";
import { colourIsolateElements, resetElements } from "../apis/elements";


export class IDSInput implements UiItemsProvider {    
  
    public readonly id: string = "IDSInputWidgetProvider";
    public static readResults = false;
    public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<Widget> {
        const widgets: Widget[] = [];
        // if (imodel && location === StagePanelLocation.Right) {      
        if (location === StagePanelLocation.Right) {
            widgets.push({
                id: "IDSInputWidget",
                label: "IDS",
                defaultState: WidgetState.Open,
                content: <IDSInputPanel/>,
            });
        }
        return widgets;
    }
  }
  const IDSInputPanel: React.FC = () => {

    type TableDataType = {    
      id : string,
      property : string,
      propertyValue: string;
      entity: string;
    };    
  const [dragIsOver, setDragIsOver] = useState(false);
  const [xmlContent, setXMLContent] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [showIsolate, setShowIsolate] = useState(false);
  const [searching, setSearching] = React.useState(false);  

  useEffect(() => {
    // Specify the path to the XML files on the server

    // Set the list of XML files    
  }, []); // Run once on component mount

    // Fetch the list of XML files

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragIsOver(true);
  };
  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragIsOver(false);
  };
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragIsOver(false);
    const droppedFiles = Array.from(event.dataTransfer.files);    
    let fileContent = '<empty/>'

    droppedFiles.forEach((file) => {
      const reader = new FileReader();
 
      reader.onloadend = () => {        
        fileContent = reader.result as string;
        setXMLContent(fileContent);
      };
 
      reader.onerror = () => {
        console.error('There was an issue reading the file.');
      };
 
      reader.readAsText(file);      
    });    
  };
    
  const convertClickHandler = async (event: any) => {
    setSearching(true);
    const vp = IModelApp.viewManager.selectedView;
    // in reality each "specification" is a single query ... so we should step through each and load into results table
    // 
    
    const ecSQL = convertXmlToEcSQL(xmlContent);
    if (vp) {
      const myRecords = await _executeQuery(vp.iModel, ecSQL);
      setResults(myRecords);
    }
    setSearching(false);

  };

  const isolateClick = (e : any) => {
    // console.log(`Isolate Clicked ${showIsolate}`);
    setShowIsolate(!showIsolate);

  }

  React.useEffect(() => {
    if (showIsolate) {
      if (results.length > 0) {
        const instanceIds = []
        for (const result in results) {
          instanceIds.push(results[result].id)          
        } 
        colourIsolateElements(IModelApp.viewManager.selectedView, instanceIds, false)
      }
    }
    else
      resetElements(IModelApp.viewManager.selectedView);
  }, [showIsolate, results])

  const columns: Column<any>[] = React.useMemo(
    (): Column<any>[] => [
      {
        id: 'entity',
        Header: 'Entity',
        accessor: 'entity',
        width: '20%',
      },

      {
        id: 'id',
        Header: 'Id',
        accessor: 'id',
        width: '30%',
      },
      {
        id: 'property',
        Header: 'Property',
        accessor: 'property',        
      },
      {
        id: 'value',
        Header: 'Value',
        accessor: 'propertyValue',
      },
    ],
    []
  );
  const rowProps = React.useCallback((row: any) => {
    return {
      status: row.original.status,
    };
  }, []);

      return (
        <div>
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50px',
        width: '100%',
        border: '1px dotted',
        backgroundColor: dragIsOver ? 'lightgray' : 'white',
      }}
    >
      Drag and drop IDS files here
    </div>
      <div style = {{display: 'inline-block'}}>
        <Button styleType="cta" style={{margin : 5}} onClick={convertClickHandler} disabled={searching}>{searching ? "Searching ..." : "Submit"}</Button>
        <ToggleSwitch label="Isolate" checked={showIsolate} onChange={isolateClick} />
      </div>
      <Table
        columns={columns}
        emptyTableContent='No data.'
        data={results}
        rowProps={rowProps}
        density='condensed'
      />
    </div>
      );
    };