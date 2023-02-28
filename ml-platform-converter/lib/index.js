const { ICommandPalette } = require("@jupyterlab/apputils");
const { ISettingRegistry } = require("@jupyterlab/settingregistry");
const { IFileBrowserFactory } = require("@jupyterlab/filebrowser");
const {
	JupyterFrontEnd,
	JupyterFrontEndPlugin,
} = require("@jupyterlab/application");

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
		const command = "notebook:convert-format";
		commands.addCommand(command, {
			label: "Convert to Notebook",
			execute: async () => {
				const browser = tracker.currentWidget;
				const currentSelectedFile = browser.selectedItems().next();
				const process = await serviceManager.terminals.startNew();
				await process.ready;
				process.send({
					type: "stdin",
					content: [
						`jupyter nbconvert ${currentSelectedFile.path} --to=pdf && exit\n\r`,
					],
				});
			},
		});
		app.contextMenu.addItem({
			command,
			selector: '.jp-DirListing-item[data-file-type="notebook"]',
			rank: 100,
		});
		palette.addItem({ command, category: "File Operations" });
	},
};

module.exports = fileContextMenuPlugin;
