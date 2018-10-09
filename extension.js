// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

const sqlops = require('sqlops');

const path = require('path');

const fs = require('fs');

const UDT = require('./udt').PARSERS;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "sqlops-spatial-results" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.sayHello', function () {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World!');

        console.log(sqlops);
        
    });

    // select top 10 * from geoobjects

    sqlops.dataprotocol.onDidChangeLanguageFlavor(() => {
        vscode.window.showInformationMessage('DidChangeLanguageFlavor!');

        let webviewPanels = {};
        let queryProviders = sqlops.dataprotocol.getProvidersByType(sqlops.DataProviderType.QueryProvider);
        queryProviders.map((queryProvider) => {
            queryProvider.registerOnBatchComplete((batchInfo) => {
                // Only allow a single Cat Coder
                const ownerUri = batchInfo.ownerUri;
                const resultSetSummary = batchInfo.batchSummary.resultSetSummaries[0];
                const geocolumns = resultSetSummary.columnInfo.filter(row => row.sqlDbType === 29);
                if (!geocolumns.length) {
                    return;
                }
                vscode.window.showInformationMessage('Spatial Result detected ('+geocolumns.length+' columns)');
                //console.log(resultSetInfo);
                queryProvider.getQueryRows({
                    ownerUri: ownerUri,
                    batchIndex: resultSetSummary.batchId,
                    resultSetIndex: resultSetSummary.id,
                    rowsStartIndex: 0,
                    rowsCount: resultSetSummary.rowCount
                }).then(data => {
                    let currentPanel = webviewPanels[ownerUri];
                    vscode.window.showInformationMessage('ResultSet loaded!');
                    if (currentPanel) {
                        //currentPanel.reveal(null, true);
                    } else {
                        currentPanel = vscode.window.createWebviewPanel(
                            'geojson.sql.'+ownerUri, 
                            'GeoJSON Viewer ['+ownerUri+']',
                            {
                                preserveFocus: true,
                                viewColumn: vscode.ViewColumn.Beside
                            },
                            {
                            // Only allow the webview to access resources in our extension's media directory
                            localResourceRoots: [
                                vscode.Uri.file(path.join(context.extensionPath, 'web'))
                            ]
                        });
                        currentPanel.onDidDispose(() => { delete webviewPanels[ownerUri]; }, undefined, context.subscriptions);
                        webviewPanels[ownerUri] = currentPanel;
                    }
                    const webRoot = vscode.Uri.file(path.join(context.extensionPath, 'web')).with({ scheme: 'vscode-resource' });
                    const filePath = vscode.Uri.file(path.join(context.extensionPath, 'web', 'index.html'));
                    const html = fs.readFileSync(filePath.fsPath, 'utf8');
                    currentPanel.webview.html = html.replace('{webroot}', webRoot.toString());
                    //sqlops.window.modelviewdialog.
                    //console.log(data);
                    parseData(data.resultSubset.rows, geocolumns);
                }, (e) => {
                    //console.log(e);
                });
                return true;
            });
            vscode.window.showInformationMessage('Connection loaded!');
        });


        /*sqlops.connection.getCurrentConnection().then((connection) => {
            // do something
            console.log(connection);
            let queryProvider = sqlops.dataprotocol.getProvider(connection.providerName, sqlops.DataProviderType.QueryProvider);
            console.log(queryProvider);
            
        });*/

    });
    

    context.subscriptions.push(disposable);

}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;


function parseData(data, geocolumns) {
    return data.map(row => {
        geocolumns.map(col => {
            const buf = Buffer.from(row[col.columnOrdinal].displayValue.substr(2),'hex');
            console.log(buf);
            console.log(UDT.geometry(buf));
        });
        return row;
    })
}
