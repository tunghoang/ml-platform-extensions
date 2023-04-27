import { Table, Tag } from "antd";
import { useContext } from "react";

import { appContext } from "@/contexts";
import { API_ENDPOINT } from "@/constants";

const columns = [
	{
		title: "Name",
		dataIndex: "name",
		key: "name",
		align: "left",
    render: (_, data) => {
      const others = JSON.parse(data.others);
      const tokens = data.name.split('/');
      const lastToken = tokens[tokens.length - 1].replace(".", "_");
      return (<a href={`${window.location.protocol}//${window.location.hostname}:${others.port}/${lastToken}/`} target="_blank">{data.name}</a>)
    }
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
              console.log("Delete service");
							await fetch(`${API_ENDPOINT}/services/${id}`, {
                method: "DELETE",
                credentials: "include",
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
