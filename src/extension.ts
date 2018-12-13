'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// The module 'sqlops' contains the SQL Operations Studio extensibility API
// This is a complementary set of APIs that add SQL / Data-specific functionality to the app
// Import the module and reference it with the alias sqlops in your code below

import * as sqlops from 'sqlops';

import * as path from 'path';

import * as fs from 'fs';

const UDT = require('./udt');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "sqlops-mssql-spatial-preview" is now active!');

    context.subscriptions.push(vscode.commands.registerCommand('extension.showCurrentConnection', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        sqlops.connection.getCurrentConnection().then(connection => {
            let connectionId = connection ? connection.connectionId : 'No connection found!';
            vscode.window.showInformationMessage(connectionId);
        }, error => {
             console.info(error);
        });
    }));


    sqlops.dataprotocol.onDidChangeLanguageFlavor(() => {

        vscode.window.showInformationMessage('DidChangeLanguageFlavor_9999!');
        let webviewPanels: any = {};
        let queryProviders = sqlops.dataprotocol.getProvidersByType(sqlops.DataProviderType.QueryProvider);
        queryProviders.map((queryProvider: any) => {
            queryProvider.registerOnBatchComplete((batchInfo: any) => {
                // Only allow a single Cat Coder
                const ownerUri = batchInfo.ownerUri;
                const resultSetSummary = batchInfo.batchSummary.resultSetSummaries[0];
                const geocolumns = resultSetSummary.columnInfo.filter((row: any) => row.sqlDbType === 29);
                if (!geocolumns.length) {
                    return;
                }
                //vscode.window.showInformationMessage('Spatial Result detected ('+geocolumns.length+' columns)');
                //console.log(resultSetInfo);
                queryProvider.getQueryRows({
                    ownerUri: ownerUri,
                    batchIndex: resultSetSummary.batchId,
                    resultSetIndex: resultSetSummary.id,
                    rowsStartIndex: 0,
                    rowsCount: resultSetSummary.rowCount
                }).then((data: any) => {
                    let currentPanel = webviewPanels[ownerUri];
                    //vscode.window.showInformationMessage('ResultSet loaded!');
                    if (currentPanel) {
                        //currentPanel.reveal(null, true);
                    } else {
                        currentPanel = vscode.window.createWebviewPanel(
                            'geojson.sql.'+ownerUri, 
                            `Spatial Preview [${ownerUri}]`,
                            {
                                preserveFocus: true,
                                viewColumn: vscode.ViewColumn.Beside,
                            },
                            {
                                enableScripts: true,
                                // Only allow the webview to access resources in our extension's media directory
                                localResourceRoots: [
                                    vscode.Uri.file(path.join(context.extensionPath, 'src', 'web')),
                                    vscode.Uri.file(path.join(context.extensionPath, 'out', 'web')),
                                ]
                            }
                        );
                        currentPanel.onDidDispose(() => {
                            delete webviewPanels[ownerUri];
                        }, undefined, context.subscriptions);
                        webviewPanels[ownerUri] = currentPanel;
                    }
                    const jsRoot = vscode.Uri.file(path.join(context.extensionPath, 'out', 'web')).with({ scheme: 'vscode-resource' });
                    const webRoot = vscode.Uri.file(path.join(context.extensionPath, 'src', 'web')).with({ scheme: 'vscode-resource' });
                    const filePath = vscode.Uri.file(path.join(context.extensionPath, 'src', 'web', 'index.html'));
                    const html = fs.readFileSync(filePath.fsPath, 'utf8');
                    currentPanel.webview.html = html.replace('{webroot}', webRoot.toString()).replace('{jsroot}', jsRoot.toString());
                    //sqlops.window.modelviewdialog.
                    const parsedData = parseData(data.resultSubset.rows, geocolumns);
                    currentPanel.title = `${parsedData.length} Spatial Results [${ownerUri}]`;
                    currentPanel.webview.postMessage({ command: 'load', data: parsedData, geocolumns: geocolumns });
                }, (e: any) => {
                    //console.log(e);
                });
                return true;
            });
            //vscode.window.showInformationMessage('Connection loaded!');
        });
    });
}

// this method is called when your extension is deactivated
export function deactivate() {
}

function parseData(data: any, geocolumns: any) {
    return data.map((row: any) => {
        return geocolumns.map((col: any) => {
            const buf = Buffer.from(row[col.columnOrdinal].displayValue.substr(2),'hex');
            try {
                const geoObj = UDT.geometry(buf);
                return geoObj;
            } catch (e) {
                return null;
            }
        });
        return row;
    });
}