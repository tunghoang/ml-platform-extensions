import { ReactWidget } from "@jupyterlab/apputils";
import { useEffect, useContext } from "react";
import { Space } from "antd";

import { CustomTable, LoginForm } from "@/components";
import { appContext, AppContextProvider } from "@/contexts";
import { API_ENDPOINT } from "@/constants";

const ServicesTableComponent = () => {
	const { setData, isAuthenticated, setIsAuthenticated } =
		useContext(appContext);
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
				const res = await fetch(`${API_ENDPOINT}/services`, {
					credentials: "include",
				});
				const data = await res.json();
				setData(data);
			})();
		}
	}, []);
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
