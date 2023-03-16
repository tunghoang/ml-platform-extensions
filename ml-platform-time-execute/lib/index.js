import { ICommandPalette } from "@jupyterlab/apputils";
import { INotebookTracker } from "@jupyterlab/notebook";
import { Widget } from "@lumino/widgets";
import { JSONExt } from "@lumino/coreutils";
import { checkIcon, closeIcon } from "@jupyterlab/ui-components";
import {
	JupyterFrontEnd,
	JupyterFrontEndPlugin,
} from "@jupyterlab/application";
import { LabIcon } from "@jupyterlab/ui-components";
import { DateTime } from "luxon";
import {
	HISTORY_MAX_LENGTH,
	ANIMATE_CSS,
	EXECUTE_TIME_CLASS,
	ANIMATE_TIME_MS,
	TOOLTIP_PREFIX,
	_settings,
	PREV_DATA_EXECUTION_TIME_ATTR,
} from "./constants";

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
