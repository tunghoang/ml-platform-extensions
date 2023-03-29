import { LabIcon } from "@jupyterlab/ui-components";

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const HISTORY_MAX_LENGTH = 5;
const EXECUTE_TIME_CLASS = "execute-time";
const TOOLTIP_PREFIX = "Previous Runs:";
const PREV_DATA_EXECUTION_TIME_ATTR = "data-prev-execution-time";

const ANIMATE_TIME_MS = 1000;
const ANIMATE_CSS = `executeHighlight ${ANIMATE_TIME_MS}ms`;

const _settings = {
	enabled: false,
	highlight: true,
	positioning: "left",
	minTime: 0,
	textContrast: "high",
	showLiveExecutionTime: true,
	historyCount: 5,
};

const spinnerIcon = new LabIcon({
	name: "spin",
	svgstr: `<svg class="spinner" width="16px" height="16px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
	<circle class="path" fill="none" stroke-width="6" stroke-linecap="round" cx="33" cy="33" r="30"></circle></svg>`,
});

export {
	$,
	$$,
	HISTORY_MAX_LENGTH,
	EXECUTE_TIME_CLASS,
	TOOLTIP_PREFIX,
	PREV_DATA_EXECUTION_TIME_ATTR,
	ANIMATE_TIME_MS,
	ANIMATE_CSS,
	_settings,
	spinnerIcon,
};
