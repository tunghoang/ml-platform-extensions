import { ReactWidget } from "@jupyterlab/apputils";
import { useEffect, useContext, useState } from "react";
import { Space } from "antd";

import { CustomTable, LoginForm } from "@/components";
import { appContext, AppContextProvider } from "@/contexts";

const columns = [
	{
		title: "Route",
		dataIndex: "others",
		key: "others",
		align: "left",
		render: (_, obj) => {
			let tokens = obj.name.split("/");
			let shortName = tokens.pop();
			shortName = shortName.replace(".", "_");
			let others = JSON.parse(obj.others);
			return (
				<a href={`${window.location.origin}:${others.port}/${shortName}/`}>
					/{shortName}/
				</a>
			);
		},
	},
	{
		title: "Port",
		dataIndex: "others",
		key: "others",
		align: "left",
		render: (_, obj) => {
			let others = JSON.parse(obj.others);
			return <span>{others.port}</span>;
		},
	},
	{
		title: "Name",
		dataIndex: "name",
		key: "name",
		align: "left",
	},
	{
		title: "Type",
		dataIndex: "type",
		key: "type",
		align: "left",
	},
	{
		title: "Action",
		dataIndex: "deleted",
		key: "deleted",
		render: (_, data) => {
			const { id, deleted } = data;
			if (!deleted)
				return (
					<Tag
						color="red"
						style={{ cursor: "pointer", textAlign: "center" }}
						onClick={async () => {
							let newData = await fetch(`${API_ENDPOINT}/${id}`, {
								method: "DELETE",
							});
							newData = await newData.json();
							// console.log(newData);
							// setData(newData);
						}}>
						Delete
					</Tag>
				);
		},
		align: "right",
	},
];

const ServicesTableComponent = () => {
	const { setData, isAuthenticated, setIsAuthenticated } =
		useContext(appContext);
	const API_ENDPOINT = window.location.origin + ":5000/services";
	const [count, setCount] = useState(0);
	useEffect(() => {
		(async () => {
			const res = await fetch(`${API_ENDPOINT}/auth`, {
				credentials: "include",
			});
			if (res.status === 200) setIsAuthenticated(true);
		})();
	}, []);
	useEffect(() => {
		if (isAuthenticated) {
			(async () => {
				console.log("Reload services");
				const res = await fetch(API_ENDPOINT, {
					credentials: "include",
				});
				const data = await res.json();
				setData(data);
				setTimeout(function () {
					let _count = count + 1;
					console.log(count);
					setCount(_count);
				}, 3000);
			})();
		}
	}, [count]);
	return (
		<Space
			style={{ padding: "20px", width: "100%", height: "100%" }}
			direction="vertical">
			{isAuthenticated ? <CustomTable /> : <LoginForm />}
		</Space>
	);
};

export class ServicesTableWidget extends ReactWidget {
	constructor() {
		super();
		this.addClass("jp-ReactWidget");
	}

	render() {
		return (
			<AppContextProvider>
				<ServicesTableComponent />
			</AppContextProvider>
		);
	}
}
