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
						const { port, name } = values;
						const process = await serviceManager.terminals.startNew();
						process.send({
							type: "stdin",
							content: [command.command(currentSelectedFile.path, port)],
						});
						return;
					}
					const process = await serviceManager.terminals.startNew();
					process.send({
						type: "stdin",
						content: [command.command(currentSelectedFile.path)],
					});
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
