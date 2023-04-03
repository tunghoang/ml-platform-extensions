const commands = [
  {
    name: "notebook:convert-format",
    label: "Convert Notebook",
    command: (currentFileName, currentFilePath) =>
      `jupyter nbconvert ${currentFileName} --to=pdf && exit\n\r`,
    dialog: false,
  },
  {
    name: "notebook:export-service",
    label: "Export as service",
    command: (currentFileName, currentFilePath, port) => {
      console.log(`Hi hi hi:"${currentFileName}" "${currentFilePath}" ${port}`);
      return `bash /opt/tljh/scripts/export-service.sh "${currentFileName}" "${currentFilePath}" ${port} && exit\n\r`
    },
    dialog: {
      inputs: [{ name: "port", type: "number" }],
    },
  },
];

module.exports = commands;
