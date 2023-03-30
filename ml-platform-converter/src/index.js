import { ICommandPalette } from "@jupyterlab/apputils";
import { IFileBrowserFactory } from "@jupyterlab/filebrowser";
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from "@jupyterlab/application";

import { renderDialog } from "./widget";
import commandList from "./commands";

/**
 * @type {JupyterFrontEndPlugin}
 */
const fileContextMenuPlugin = {
  id: "jupyterlab-file-context-menu",
  autoStart: true,
  requires: [ICommandPalette, IFileBrowserFactory],
  /**
   *
   * @param {JupyterFrontEnd} app
   * @param {ICommandPalette} palette
   * @param {IFileBrowserFactory} factory
   */
  activate: (app, palette, factory) => {
    console.log(
      "JupyterLab extension jupyterlab-file-context-menu is activated!"
    );
    const { commands, serviceManager } = app;
    const { tracker } = factory;

    function getCurrentDir() {
      // return window.location.pathname.replace('/user/admin/lab', "").replace("/tree", "");
      const paths = window.location.pathname.split("/");
      if (paths.includes("tree"))
        return `${paths.at(-1)}`
      return ""
    }

    commandList.forEach((command) => {
      commands.addCommand(command.name, {
        label: command.label,
        execute: async () => {
          const browser = tracker.currentWidget;
          const currentSelectedFile = browser.selectedItems().next();
          if (command.dialog) {
            const values = await renderDialog(
              command.label,
              command.dialog.inputs
            );
            const { port } = values;
            const process = await serviceManager.terminals.startNew();
            console.log("currentFile", currentSelectedFile, currentSelectedFile.path);
            console.log("Dir", getCurrentDir());
            console.log("Port", port);
            process.send({
              type: "stdin",
              content: [command.command(currentSelectedFile.path, getCurrentDir(), port)],
            });
          }
          else {
            const process = await serviceManager.terminals.startNew();
            process.send({
              type: "stdin",
              content: [command.command(currentSelectedFile.path, getCurrentDir())],
            });
          }
          return;
        },
      });
      app.contextMenu.addItem({
        command: command.name,
        selector: '.jp-DirListing-item[data-file-type="notebook"]',
        rank: 100,
      });
      palette.addItem({ command, category: "File Operations" });
    });
  },
};

export default [fileContextMenuPlugin];
