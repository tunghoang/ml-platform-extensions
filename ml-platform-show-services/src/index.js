import {
	JupyterFrontEnd,
	JupyterFrontEndPlugin,
	ILayoutRestorer,
} from "@jupyterlab/application";

import {
	ICommandPalette,
	MainAreaWidget,
	WidgetTracker,
} from "@jupyterlab/apputils";
import { ISettingRegistry } from "@jupyterlab/settingregistry";

import { ServicesTableWidget } from "./widget";
import { reactIcon } from "@jupyterlab/ui-components";

const PLUGIN_ID = "ml-platform-show-services:plugin";

/**
 * @type {JupyterFrontEndPlugin}
 */
const showServicesPlugin = {
	id: PLUGIN_ID,
	autoStart: true,
	requires: [ICommandPalette, ISettingRegistry],
	optional: [ILayoutRestorer],
	/**
	 *
	 * @param {JupyterFrontEnd} app
	 * @param {ICommandPalette} palette
	 * @param {ISettingRegistry} settings
	 */
	activate: async (app, palette, settings, restorer) => {
		console.log("Jupyter lab extension show services is activated!");

		let tracker = new WidgetTracker({ namespace: "services" });
		let widget;

		const { commands } = app;
		const command = "jlab:open-services-dashboard";
		commands.addCommand(command, {
			id: "jlab:open-services-dashboard",
			caption: "Open Services Dashboard",
			label: "Open Services Dashboard",
			execute: () => {
				if (!widget || widget.isDisposed) {
					const content = new ServicesTableWidget();
					widget = new MainAreaWidget({ content });
					widget.id = "services-dashboard";
					widget.title.label = "Services Dashboard";
					widget.title.icon = reactIcon;
					widget.title.closable = true;
				}
				if (!tracker.has(widget)) {
					tracker.add(widget);
				}
				if (!widget.isAttached) {
					app.shell.add(widget, "main");
				}
				app.shell.activateById(widget.id);
			},
		});
		await settings.load(PLUGIN_ID);

		palette.addItem({ command, category: "Customization" });

		if (restorer) {
			restorer.restore(tracker, {
				command,
				name: () => "services",
			});
		}
	},
};

export default showServicesPlugin;
