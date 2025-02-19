import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Data from "./pages/Data.tsx";
import WebSocketTest from "./testing/WebSocketTest.tsx";

function App() {
	return (
		<>
			<Router>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/data" element={<Data />} />
				</Routes>
			</Router>
			{/* <WebSocketTest /> */}
		</>
	);
}

export default App;
