import { ReactWidget } from "@jupyterlab/apputils";
import { Table, Tag } from "antd";
import { useEffect, useState } from "react";

const API_ENDPOINT = "http://localhost:5000/services";

const columns = [
	{
		title: "Name",
		dataIndex: "name",
		key: "name",
		align: "center",
	},
	{
		title: "Type",
		dataIndex: "type",
		key: "type",
		align: "center",
	},
	{
		title: "Others",
		dataIndex: "others",
		key: "others",
		align: "center",
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
						style={{ width: "100%", cursor: "pointer", textAlign: "center" }}
						onClick={async () => {
							await fetch(`${API_ENDPOINT}/${id}`, {
								method: "DELETE",
							});
							setData(data.filter((d) => d.id !== id));
						}}>
						Delete
					</Tag>
				);
		},
		align: "center",
	},
];

const ServicesTableComponent = () => {
	const [data, setData] = useState([]);
	useEffect(() => {
		(async () => {
			const res = await fetch(API_ENDPOINT);
			const data = await res.json();
			setData(data);
		})();
	}, []);
	return (
		<div style={{ padding: "20px" }}>
			<Table
				columns={columns}
				dataSource={data}
				bordered
				size="small"
				title={() => (
					<div style={{ textAlign: "center" }}>
						<b>Services</b>
					</div>
				)}></Table>
		</div>
	);
};

export class ServicesTableWidget extends ReactWidget {
	constructor() {
		super();
		this.addClass("jp-ReactWidget");
	}

	render() {
		return <ServicesTableComponent />;
	}
}
