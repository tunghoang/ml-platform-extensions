import { Table, Tag } from "antd";
import { useContext } from "react";

import { appContext } from "@/contexts";

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

const CustomTable = () => {
	const { data } = useContext(appContext);
	return (
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
	);
};

export default CustomTable;
