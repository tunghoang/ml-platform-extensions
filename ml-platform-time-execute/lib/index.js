const { ToolbarButton, ICommandPalette } = require("@jupyterlab/apputils");
const { INotebookTracker } = require("@jupyterlab/notebook");
const { Widget } = require("@lumino/widgets");
const { JSONExt } = require("@lumino/coreutils");
const { checkIcon, closeIcon } = require("@jupyterlab/ui-components");
const {
	JupyterFrontEnd,
	JupyterFrontEndPlugin,
} = require("@jupyterlab/application");
const { LabIcon } = require("@jupyterlab/ui-components");
const configs = require("../configs.json");
const { DateTime } = require("luxon");
const {
	HISTORY_MAX_LENGTH,
	ANIMATE_CSS,
	EXECUTE_TIME_CLASS,
	ANIMATE_TIME_MS,
	TOOLTIP_PREFIX,
	_settings,
	PREV_DATA_EXECUTION_TIME_ATTR,
} = require("./constants");

/**
 * @type {JupyterFrontEndPlugin}
 */
// const externalVoilaPlugin = {
// 	id: "jupyterlab-external-voila",
// 	autoStart: true,
// 	requires: [INotebookTracker],
// 	/**
// 	 *
// 	 * @param {JupyterFrontEnd} app
// 	 * @param {NotebookTracker} notebookTracker
// 	 */
// 	activate: (app, notebookTracker) => {
// 		console.log("JupyterLab extension jupyterlab-external-voila is activated!");
// 		const { commands } = app;
// 		const button = new ToolbarButton({
// 			label: "Voila external",
// 			onClick: async () => {
// 				const path = notebookTracker.currentWidget.context.path;
// 				let t = await commands.execute("terminal:create-new");
// 				let terminal = t.content;
// 				terminal.session.send({
// 					type: "stdin",
// 					content: [`voila ${path}\n\r`],
// 				});
// 			},
// 		});
// 		notebookTracker.currentChanged.connect((sender, panel) => {
// 			panel.toolbar.insertItem(10, "voilaExternal", button);
// 		});
// 	},
// 	commands.addCommand("notebook:time-execute", {
// 		label: "Show time execute",
// 		execute: async (cell) => {
// 			console.log(cell);
// 			const cellNode = cell.cellNode;
// 			const parent = cellNode.parentElement;
// 			const _child = parent.querySelector(".CodeMirror");
// 			if (!_child.querySelector(".query__icon")) {
// 				const executionTime = document.createElement("div");
// 				executionTime.className = "execution-time";
// 				executionTime.innerHTML = `<div style="margin-right: 4px" class='query__icon'></div><div><span class='query-time'></span></div>`;
// 				_child.appendChild(executionTime);
// 			}
// 			const executionTime = _child.querySelector(".execution-time");
// 			const queryIcon = executionTime.querySelector(".query__icon");
// 			const queryTime = executionTime.querySelector(".query-time");
// 			queryIcon.innerHTML = `<div><svg class="spinner" width="16px" height="16px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
// 			<circle class="path" fill="none" stroke-width="6" stroke-linecap="round" cx="33" cy="33" r="30"></circle></svg></div>`;
// 			let time = 0.1;
// 			while (cellNode.innerText === "[*]:") {
// 				time += 0.1;
// 				queryTime.innerHTML = `${time.toFixed(2)}s`;
// 				await sleep(100);
// 			}
// 			queryIcon.innerHTML = checkIcon.element().outerHTML;
// 		},
// 	});
// 	$("button[data-command='runmenu:run']").addEventListener(
// 		"click",
// 		(e) => {
// 			e.preventDefault();
// 			commands.execute("notebook:time-execute", {
// 				cellNode: document.evaluate(
// 					"//div[text()='[*]:']",
// 					document,
// 					null,
// 					XPathResult.FIRST_ORDERED_NODE_TYPE,
// 					null
// 				).singleNodeValue,
// 			});
// 		}
// 	);
// };

const spinnerIcon = new LabIcon({
	name: "spin",
	svgstr: `<svg class="spinner" width="16px" height="16px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
	<circle class="path" fill="none" stroke-width="6" stroke-linecap="round" cx="33" cy="33" r="30"></circle></svg>`,
});

class ShowTimeExecuteExtension {
	constructor(tracker) {
		this.tracker = tracker;
	}
	createNew(notebookPanel, context) {
		return new ShowTimeExecuteWidget(notebookPanel, this.tracker);
	}
}

class ShowTimeExecuteWidget extends Widget {
	constructor(notebookPanel, notebookTracker) {
		super();
		this.notebookPanel = notebookPanel;
		this.notebookTracker = notebookTracker;
		this.updateConnectedCell = this.updateConnectedCell.bind(this);
		this._cellSlotMap = {};

		const cells = notebookPanel.model.cells;
		cells.changed.connect(this.updateConnectedCell);
		for (let i = 0; i < cells.length; i++) {
			this._registerMetadataChanges(cells.get(i));
		}
	}

	_removeExecuteNode(cell) {
		const executionTimeNode = cell.node.querySelector(`.${EXECUTE_TIME_CLASS}`);
		if (executionTimeNode) {
			executionTimeNode.remove();
		}
	}

	_getCodeCell(cellModel) {
		if (cellModel.type === "code") {
			const cell = this.notebookPanel.content.widgets.find(
				(widget) => widget.model === cellModel
			);
			return cell;
		}
		return null;
	}

	_deregisterMetadataChanges(cellModel) {
		const fn = this._cellSlotMap[cellModel.id];
		if (fn) {
			cellModel.metadata.changed.disconnect(fn);
			const codeCell = this._getCodeCell(cellModel);
			if (codeCell) {
				this._removeExecuteNode(codeCell);
			}
		}
		delete this._cellSlotMap[cellModel.id];
	}

	_cellMetadataChanged(cellModel, disableHighlight = false) {
		const codeCell = this._getCodeCell(cellModel);
		if (codeCell) {
			this._updateCodeCell(codeCell, disableHighlight);
		} else {
			if (cellModel.type === "code") {
				console.error(`Could not find code cell for model: ${cellModel}`);
			}
		}
	}

	_registerMetadataChanges(cellModel) {
		if (!(cellModel.id in this._cellSlotMap)) {
			const fn = () => this._cellMetadataChanged(cellModel);
			this._cellSlotMap[cellModel.id] = fn;
			cellModel.metadata.changed.connect(fn);
		}
		this._cellMetadataChanged(cellModel, true);
	}

	updateConnectedCell(cells, changed) {
		changed.oldValues.forEach(this._deregisterMetadataChanges.bind(this));
		changed.newValues.forEach(this._registerMetadataChanges.bind(this));
	}

	_updateCodeCell(cell, disableHighlight) {
		const executionMetadata = cell.model.metadata.get("execution");
		if (executionMetadata && JSONExt.isObject(executionMetadata)) {
			let executionTimeNode = cell.node.querySelector(`.${EXECUTE_TIME_CLASS}`);
			const parentNode = cell.inputArea.editorWidget.node;

			if (!executionTimeNode) {
				executionTimeNode = document.createElement("div");
				executionTimeNode.className = "execution-time";
				executionTimeNode.innerHTML = `<div class='query'><div style="margin-right: 4px" class='query__icon'></div><div class='query__time--center'><span class='query__time'></span></div></div><div class='query__detail--center'><span class='query__detail'></span></div>`;

				if (!cell.inputHidden) {
					parentNode.append(executionTimeNode);
				}
			} else if (executionTimeNode.parentNode !== parentNode) {
				executionTimeNode.remove();
				parentNode.append(executionTimeNode);
			}
			executionTimeNode.onclick = (_tracker) => {
				if (_tracker.activeCell !== cell) {
					cell.activate();
				}
			};

			const positioning = "left";
			const positioningClass = `${EXECUTE_TIME_CLASS}-positioning-${positioning}`;
			const textContrastClass = `${EXECUTE_TIME_CLASS}-contrast-${_settings.textContrast}`;
			executionTimeNode.className = `${EXECUTE_TIME_CLASS} ${positioningClass} ${textContrastClass}`;

			const startTimeStr =
				executionMetadata["shell.execute_reply.started"] ||
				executionMetadata["iopub.execute_input"];
			const startTime = startTimeStr ? DateTime.fromISO(startTimeStr) : null;
			const endTimeStr = executionMetadata["shell.execute_reply"];
			const endTime = endTimeStr ? DateTime.fromISO(endTimeStr) : null;

			let msg = "";
			if (endTime) {
				const executionTime = endTime
					.diff(startTime, "seconds")
					.seconds.toFixed(2);
				if (executionTime >= 0) {
					const lastExecutionTime = executionTimeNode.getAttribute(
						PREV_DATA_EXECUTION_TIME_ATTR
					);
					// Store the last execution time in the node to be used for various options
					executionTimeNode.setAttribute(
						PREV_DATA_EXECUTION_TIME_ATTR,
						`${endTime.toFormat("dd/LL/yyyy HH:mm:ss")} (${executionTime}s)`
					);
					// Only add a tooltip for all non-displayed execution times.
					if (lastExecutionTime) {
						let tooltip = executionTimeNode.getAttribute("title");
						const executionTimes = [lastExecutionTime];
						if (tooltip) {
							executionTimes.push(
								...tooltip.substring(TOOLTIP_PREFIX.length + 1).split("\n")
							);
							// JS does the right thing of having empty items if extended
							executionTimes.length = HISTORY_MAX_LENGTH;
						}
						tooltip = `${TOOLTIP_PREFIX}\n${executionTimes.join("\n")}`;
						executionTimeNode.setAttribute("title", tooltip);
					}
					executionTimeNode.querySelector(".query__detail").innerText = "";

					msg = `Last executed at ${endTime.toFormat(
						"dd/LL/yyyy HH:mm:ss"
					)} in ${executionTime}s`;
				}
			} else if (startTime) {
				executionTimeNode.querySelector(".query__icon").innerHTML =
					spinnerIcon.element().outerHTML;
				const workingTimer = setInterval(() => {
					if (
						!executionTimeNode
							.querySelector(".query__detail")
							.innerText.startsWith("Execution started at")
					) {
						clearInterval(workingTimer);
						return;
					}
					const executionTime = DateTime.now()
						.diff(startTime, "seconds")
						.seconds.toFixed(2);
					if (executionTime >= 0) {
						executionTimeNode.querySelector(
							".query__time"
						).innerText = `${executionTime}s`;
					}
				}, 100);
				msg = `Execution started at ${startTime.toFormat(
					"dd/LL/yyyy HH:mm:ss"
				)}`;
			}
			if (executionTimeNode.textContent !== msg) {
				executionTimeNode.querySelector(".query__detail").innerText = msg;

				if (!disableHighlight && endTimeStr) {
					executionTimeNode.style.setProperty("animation", ANIMATE_CSS);
					if (
						this._getCodeCell(cell.model).outputArea.node.innerHTML.includes(
							"Traceback"
						)
					) {
						executionTimeNode.querySelector(".query__icon").innerHTML =
							closeIcon.element().outerHTML;
					} else {
						executionTimeNode.querySelector(".query__icon").innerHTML =
							checkIcon.element().outerHTML;
					}
					setTimeout(() => {
						executionTimeNode.style.removeProperty("animation");
					}, ANIMATE_TIME_MS);
				}
			}
		} else {
			// Hide it if data was removed (e.g. clear output).
			// Don't remove as element store history, which are useful for later showing past runtime.
			const executionTimeNode = cell.node.querySelector(
				`.${EXECUTE_TIME_CLASS}`
			);
			if (executionTimeNode) {
				executionTimeNode.classList.add("execute-time-hidden");
			}
		}
	}
}

/**
 * @type {JupyterFrontEndPlugin}
 */
const showTimeExecutePlugin = {
	id: "jupyterlab-show-time-execute",
	autoStart: true,
	requires: [INotebookTracker, ICommandPalette],
	/**
	 *
	 * @param {JupyterFrontEnd} app
	 * @param {INotebookTracker} notebookTracker
	 * @param {ISettingRegistry} settingRegistry
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
/**
 * @type {JupyterFrontEndPlugin}
 */
const autoButtonsPlugin = {
	id: "jupyterlab-auto-buttons",
	autoStart: true,
	requires: [INotebookTracker, ICommandPalette],
	/**
	 *
	 * @param {JupyterFrontEnd} app
	 * @param {INotebookTracker} notebookTracker
	 * @param {ICommandPalette} palette
	 */
	activate: (app, notebookTracker, palette) => {
		notebookTracker.currentChanged.connect((sender, notebookPanel) => {
			notebookPanel.context.ready.then(() => {
				configs.forEach((config) => {
					const buttoncfg = {
						label: config.label,
						onClick: async () => {
							const path = notebookPanel.context.path;
							let t = await app.commands.execute(config.command);
						},
					};
					if (config.icon) {
						buttoncfg.icon = new LabIcon({
							name: config.name,
							svgstr: config.icon,
						});
						delete buttoncfg.label;
					}
					const button = new ToolbarButton(buttoncfg);
					notebookPanel.toolbar.insertItem(10, config.name, button);
				});
			});
		});
	},
};

module.exports = [
	// externalVoilaPlugin,
	showTimeExecutePlugin,
];
