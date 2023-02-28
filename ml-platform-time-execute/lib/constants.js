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

module.exports = {
	$,
	$$,
	HISTORY_MAX_LENGTH,
	EXECUTE_TIME_CLASS,
	TOOLTIP_PREFIX,
	PREV_DATA_EXECUTION_TIME_ATTR,
	ANIMATE_TIME_MS,
	ANIMATE_CSS,
	_settings,
};
