const path = require("path");
const glob = require("glob");

module.exports = {
	mode: "development",
	entry: Object.assign(
		{},
		...glob
			.sync("./src/*.{js,jsx}")
			.map((file) => ({ [path.basename(file, path.extname(file))]: file }))
	),
	output: {
		filename: "[name].js",
		path: path.resolve(__dirname, "lib"),
	},
	module: {
		rules: [
			{
				test: /(\.js|\.jsx)$/,
				use: {
					loader: "babel-loader",
					options: {
						presets: ["@babel/preset-react"],
					},
				},
			},
			{
				test: /\.svg$/,
				loader: "svg-inline-loader",
			},
		],
	},
};
