import { useContext, useState } from "react";
import { Button, Checkbox, Form, Input } from "antd";

import { API_ENDPOINT } from "@/constants";
import { appContext } from "@/contexts";

const LoginForm = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const { setIsAuthenticated } = useContext(appContext);
	console.log(process.env);

	const handleLogin = async (username, password) => {
		let res = await fetch(`${API_ENDPOINT}/auth/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify({ username, password }),
		});
		if (res.status === 200) setIsAuthenticated(true);
	};
	return (
		<Form
			name="basic"
			labelCol={{ span: 8 }}
			wrapperCol={{ span: 16 }}
			style={{ maxWidth: 600 }}
			initialValues={{ remember: true }}
			autoComplete="off">
			<Form.Item
				label="Username"
				name="username"
				rules={[{ required: true, message: "Please input your username!" }]}>
				<Input value={username} onChange={(e) => setUsername(e.target.value)} />
			</Form.Item>

			<Form.Item
				label="Password"
				name="password"
				rules={[{ required: true, message: "Please input your password!" }]}>
				<Input.Password
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
			</Form.Item>

			<Form.Item
				name="remember"
				valuePropName="checked"
				wrapperCol={{ offset: 8, span: 16 }}>
				<Checkbox>Remember me</Checkbox>
			</Form.Item>

			<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
				<Button
					type="primary"
					htmlType="submit"
					onClick={() => handleLogin(username, password)}>
					Submit
				</Button>
			</Form.Item>
		</Form>
	);
};

export default LoginForm;
