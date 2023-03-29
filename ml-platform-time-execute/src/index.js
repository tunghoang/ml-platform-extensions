import { INotebookTracker } from "@jupyterlab/notebook";
import {
	JupyterFrontEnd,
	JupyterFrontEndPlugin,
} from "@jupyterlab/application";
import { _settings } from "./constants";

class ShowTimeExecuteExtension {
	constructor(tracker) {
		this.tracker = tracker;
	}
	createNew(notebookPanel, context) {
		return new ShowTimeExecuteWidget(notebookPanel, this.tracker);
	}
}

/**
 * @type {JupyterFrontEndPlugin}
 */
const showTimeExecutePlugin = {
	id: "jupyterlab-show-time-execute",
	autoStart: true,
	requires: [INotebookTracker],
	/**
	 *
	 * @param {JupyterFrontEnd} app
	 * @param {INotebookTracker} notebookTracker
	 */
	activate: (app, notebookTracker) => {
		console.log(
			"JupyterLab extension jupyterlab-show-cell-execution-time is activated!"
		);
		app.docRegistry.addWidgetExtension(
			"Notebook",
			new ShowTimeExecuteExtension(notebookTracker)
		);
	},
};

export default showTimeExecutePlugin;
