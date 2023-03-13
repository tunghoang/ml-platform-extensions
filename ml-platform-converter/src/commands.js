const commands = [
	{
		name: "notebook:convert-format",
		label: "Convert Notebook",
		command: (currentFilePath) =>
			`jupyter nbconvert ${currentFilePath} --to=pdf && exit\n\r`,
		dialog: false,
	},
	{
		name: "notebook:export-service",
		label: "Export as service",
		command: (currentFilePath, port) =>
			`bash /opt/tljh/scripts/export-service.sh ${currentFilePath} ${port} && exit\n\r`,
		dialog: {
			inputs: [
				{ name: "port", type: "number" },
				{ name: "name", type: "text" },
			],
		},
	},
];

module.exports = commands;
