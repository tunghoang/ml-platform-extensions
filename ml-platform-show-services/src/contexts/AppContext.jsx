import { createContext, useState } from "react";

const appContext = createContext();

const AppContextProvider = ({ children }) => {
	const [data, setData] = useState([]);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	return (
		<appContext.Provider
			value={{
				data,
				setData,
				isAuthenticated,
				setIsAuthenticated,
			}}>
			{children}
		</appContext.Provider>
	);
};

export default appContext;

export { AppContextProvider };
