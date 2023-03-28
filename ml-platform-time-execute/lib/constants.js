"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.spinnerIcon = exports._settings = exports.TOOLTIP_PREFIX = exports.PREV_DATA_EXECUTION_TIME_ATTR = exports.HISTORY_MAX_LENGTH = exports.EXECUTE_TIME_CLASS = exports.ANIMATE_TIME_MS = exports.ANIMATE_CSS = exports.$$ = exports.$ = void 0;
var _uiComponents = require("@jupyterlab/ui-components");
var $ = document.querySelector.bind(document);
exports.$ = $;
var $$ = document.querySelectorAll.bind(document);
exports.$$ = $$;
var HISTORY_MAX_LENGTH = 5;
exports.HISTORY_MAX_LENGTH = HISTORY_MAX_LENGTH;
var EXECUTE_TIME_CLASS = "execute-time";
exports.EXECUTE_TIME_CLASS = EXECUTE_TIME_CLASS;
var TOOLTIP_PREFIX = "Previous Runs:";
exports.TOOLTIP_PREFIX = TOOLTIP_PREFIX;
var PREV_DATA_EXECUTION_TIME_ATTR = "data-prev-execution-time";
exports.PREV_DATA_EXECUTION_TIME_ATTR = PREV_DATA_EXECUTION_TIME_ATTR;
var ANIMATE_TIME_MS = 1000;
exports.ANIMATE_TIME_MS = ANIMATE_TIME_MS;
var ANIMATE_CSS = "executeHighlight ".concat(ANIMATE_TIME_MS, "ms");
exports.ANIMATE_CSS = ANIMATE_CSS;
var _settings = {
  enabled: false,
  highlight: true,
  positioning: "left",
  minTime: 0,
  textContrast: "high",
  showLiveExecutionTime: true,
  historyCount: 5
};
exports._settings = _settings;
var spinnerIcon = new _uiComponents.LabIcon({
  name: "spin",
  svgstr: "<svg class=\"spinner\" width=\"16px\" height=\"16px\" viewBox=\"0 0 66 66\" xmlns=\"http://www.w3.org/2000/svg\">\n\t<circle class=\"path\" fill=\"none\" stroke-width=\"6\" stroke-linecap=\"round\" cx=\"33\" cy=\"33\" r=\"30\"></circle></svg>"
});
exports.spinnerIcon = spinnerIcon;