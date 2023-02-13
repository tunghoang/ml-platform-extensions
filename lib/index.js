const {
	MainAreaWidget,
	ToolbarButton,
	ICommandPalette,
} = require("@jupyterlab/apputils");
const {
	NotebookPanel,
	INotebookTracker,
	NotebookTracker,
	NotebookActions,
} = require("@jupyterlab/notebook");
const { checkIcon, closeIcon } = require("@jupyterlab/ui-components");
const {
	ILayoutRestorer,
	JupyterLab,
	JupyterFrontEnd,
	JupyterFrontEndPlugin,
} = require("@jupyterlab/application");
const { Widget } = require("@lumino/widgets");
const { Terminal, ITerminalTracker } = require("@jupyterlab/terminal");

/**
 * @type {JupyterFrontEndPlugin}
 */
const externalVoilaPlugin = {
	id: "jupyterlab-external-voila",
	autoStart: true,
	requires: [INotebookTracker],
	/**
	 *
	 * @param {JupyterFrontEnd} app
	 * @param {NotebookTracker} notebookTracker
	 */
	activate: (app, notebookTracker) => {
		console.log("JupyterLab extension jupyterlab-external-voila is activated!");
		const { commands } = app;
		const button = new ToolbarButton({
			label: "Voila external",
			onClick: async () => {
				const path = notebookTracker.currentWidget.context.path;
				let t = await commands.execute("terminal:create-new");
				let terminal = t.content;
				terminal.session.send({
					type: "stdin",
					content: [`voila ${path}\n\r`],
				});
			},
		});
		notebookTracker.currentChanged.connect((sender, panel) => {
			panel.toolbar.insertItem(10, "voilaExternal", button);
		});
	},
};

const sleep = (milliseconds) => {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

/**
 * @type {JupyterFrontEndPlugin}}
 */
const showTimeExecutePlugin = {
	id: "jupyterlab-show-time-execute",
	autoStart: true,
	requires: [INotebookTracker, ICommandPalette],
	/**
	 *
	 * @param {JupyterFrontEnd} app
	 * @param {INotebookTracker} notebookTracker
	 * @param {ICommandPalette} palette
	 */
	activate: (app, notebookTracker, palette) => {
		console.log(
			"JupyterLab extension jupyterlab-show-cell-execution-time is activated!"
		);
		notebookTracker.currentChanged.connect((sender, notebookPanel) => {
			notebookPanel.context.ready.then(async () => {
				if (notebookPanel) {
					const cells = notebookPanel.model.cells;
					for (let i = 0; i < cells.length; i++) {
						const cell = cells.get(i);
						const currentCellWidget = notebookPanel.content.widgets[i];
						const cellNode = currentCellWidget.node;
						const _child = cellNode.querySelector(".CodeMirror");
						const executionTime = document.createElement("div");
						executionTime.style.display = "flex";
						executionTime.style.padding = "0px 4px";
						executionTime.innerHTML = `<div style="margin-right: 4px" class='query-icon'></div><div><span class='query-time'></span></div>`;
						const queryIcon = executionTime.querySelector(".query-icon");
						const queryTime = executionTime.querySelector(".query-time");
						cell.stateChanged.connect(async (sender, args) => {
							if (queryIcon.classList.contains("done"))
								queryIcon.classList.remove("done");
							if (queryIcon.classList.contains("error"))
								queryIcon.classList.remove("error");
							_child.appendChild(executionTime);
							let time = 0.0;
							if (
								!args.newValue &&
								!queryIcon.classList.contains("done") &&
								!queryIcon.classList.contains("error")
							) {
								queryIcon.innerHTML = `<div><svg class="spinner" width="16px" height="16px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
								<circle class="path" fill="none" stroke-width="6" stroke-linecap="round" cx="33" cy="33" r="30"></circle></svg></div>`;
							}
							while (
								!args.newValue &&
								!queryIcon.classList.contains("done") &&
								!queryIcon.classList.contains("error")
							) {
								time += 0.1;
								queryTime.innerText = `${time.toFixed(2)}s`;
								await sleep(100);
							}
							if (!queryIcon.classList.contains("error")) {
								queryIcon.innerHTML = checkIcon.element().outerHTML;
								queryIcon.classList.add("done");
							}
						});
					}
					NotebookActions.executed.connect((sender, args) => {
						const { success, cell } = args;
						if (!success) {
							const queryIcon = cell.node.querySelector(".query-icon");
							queryIcon.innerHTML = closeIcon.element().outerHTML;
							queryIcon.classList.add("error");
						}
					});
				}
			});
		});
	},
};

module.exports = [externalVoilaPlugin, showTimeExecutePlugin];
