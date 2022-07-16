// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { getBase64ImageSize, readableFileSize } from "./utils";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const saveToFile = vscode.commands.registerCommand(
    "vscode-gallery.save",
    (data) => {
      const {
        dataUrl,
        imageName,
        path,
      }: { dataUrl: string; imageName: string; path: string } = data;

      const arr = dataUrl.split(",");

      if (
        arr[0] === null ||
        (arr[0].match(/:(.*?);/)?.length ?? 0) < 2 ||
        (arr[0].match(/:(.*?);/)?.[1] ?? "").split("/").length < 2
      ) {
        vscode.window.showInformationMessage(`Data format error`);
        return;
      }

      const ext = arr[0].match(/:(.*?);/)![1].split("/")[1];

      const binary = arr[1];
      const fs = require("fs");

      let destinationPath: string;

      if (imageName) {
        destinationPath = `${path.substring(
          0,
          path.lastIndexOf("/")
        )}/${imageName}.${ext}`;
      } else {
        destinationPath = `${path.substring(0, path.lastIndexOf("."))}.${ext}`;
      }

      fs.writeFile(destinationPath, binary, "base64", (error: unknown) => {
        vscode.window.showInformationMessage(`${JSON.stringify(error)}`);
      });
    }
  );

  context.subscriptions.push(saveToFile);

  const hover = vscode.languages.registerHoverProvider(
    "*",
    new (class implements vscode.HoverProvider {
      provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
      ): vscode.ProviderResult<vscode.Hover> {
        const line = document.getText(
          new vscode.Range(
            new vscode.Position(position.line, 0),
            new vscode.Position(position.line + 1, 0)
          )
        );

        const match = /data:image\/.+;base64,[a-zA-Z0-9+/=]+/.exec(line);
        if (!match) {
          return;
        }

        let imageName = "";

        const VARIABLE_NAME_REGEX = /(?:(let|const|var)\s+)(\w+)/;

        const variableName = VARIABLE_NAME_REGEX.exec(line);

        if (!variableName && position.line - 1 >= 0) {
          const previousLine = document.getText(
            new vscode.Range(
              new vscode.Position(position.line - 1, 0),
              new vscode.Position(position.line, 0)
            )
          );

          const parsedName = VARIABLE_NAME_REGEX.exec(previousLine);

          if (parsedName && parsedName.length > 2) {
            imageName = parsedName[2];
          }
        } else if (variableName && variableName.length > 2) {
          imageName = variableName[2];
        }

        const base64Image = match[0];

        const saveCommandUri = vscode.Uri.parse(
          `command:vscode-gallery.save?${encodeURIComponent(
            JSON.stringify({
              dataUrl: base64Image,
              imageName,
              path: document.uri.path,
            })
          )}`
        );

        const content = new vscode.MarkdownString(
          `<div> 
            <img src="${base64Image}"/>
            <div>
              <span>
              &nbsp; &nbsp; ${readableFileSize(getBase64ImageSize(base64Image))}
              </span> 
              <span>
                <a href="${saveCommandUri}">&nbsp;&nbsp;&nbsp;Save as image</a>
              </span> 
            </div>
        </div>`
        );

        content.supportHtml = true;
        content.isTrusted = true;
        return new vscode.Hover(content);
      }
    })()
  );

  context.subscriptions.push(hover);
}

// this method is called when your extension is deactivated
export function deactivate() {}
