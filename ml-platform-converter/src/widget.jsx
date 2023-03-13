import { ReactWidget, showDialog } from "@jupyterlab/apputils";

import React, { useState, useEffect } from "react";
import { Input, Form } from "antd";

const CustomDialogComponent = ({ inputs }) => {
	const [values, setValues] = useState({});
	useEffect(() => {
		localStorage.setItem("value", JSON.stringify(values));
	}, [values]);

	return (
		<Form name="basic">
			{inputs.map(({ name, type }) => {
				return (
					<Form.Item label={name}>
						<Input
							type={type}
							onChange={(e) =>
								setValues((prev) => ({ ...prev, [name]: e.target.value }))
							}
						/>
					</Form.Item>
				);
			})}
		</Form>
	);
};

export class CustomDialogWidget extends ReactWidget {
	constructor(inputs) {
		super();
		this.addClass("jp-ReactWidget");
		this.inputs = inputs;
	}

	render() {
		return <CustomDialogComponent inputs={this.inputs} />;
	}
}

const renderDialog = async (title, inputs) => {
	await showDialog({
		title,
		body: new CustomDialogWidget(inputs),
	});
	const inputValues = JSON.parse(localStorage.getItem("value"));
	return inputValues;
};

export { renderDialog };
