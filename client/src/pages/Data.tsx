import { useState, useEffect } from "react";
import Card from "../components/Card";
import Chart from "../components/Chart";

const Data = () => {
	const [message, setMessage] = useState("");
	const [socket, setSocket] = useState<WebSocket | null>(null);
	const [sensorData, setSensorData] = useState({
		acceleration: 0,
		altitude: 0,
		speed: 0,
		temperature: 0,
		source: "",
		vehicleHealth: "",
	});

	useEffect(() => {
		const ws = new WebSocket("ws://localhost:8000/ws/aviation-logger/");

		ws.onopen = () => {
			console.log("Websocket connection established");
			ws.send(
				JSON.stringify({
					message: "Connection from client-side =)",
					type: "join_group",
					source: "browser",
				})
			);
		};

		ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				console.log("Message from server:", data);
				setMessage(data.message);
				setSensorData({
					...sensorData,
					acceleration: data.acceleration,
					altitude: data.altitude,
					speed: data.speed,
					source: data.source,
				})
			} catch (error) {
				console.error("Error parsing message:", error);
			}
		};

		ws.onerror = (error) => {
			console.error("WebSocket error:", error);
		};

		ws.onclose = () => {
			console.log("WebSocket connection closed");
		};

		setSocket(ws);

		// Clean up on component unmount
		return () => {
			ws.close();
		};
	}, []);

	return (
		<div className="p-5">
			<h2 className="text-center text-4xl font-medium mb-5">Avionic Data</h2>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
				<Card title={"Acceleration"} value={sensorData.acceleration} unit={"km/hr/s"} />
				<Card title={"Altitude"} value={sensorData.altitude} unit={"ft"} />
				<Card title={"Speed"} value={sensorData.speed} unit={"m/s"} />
				<Card title={"Test"} value={40} unit={"m/s^2"} />
				<Card title={"Test"} value={40} unit={"m/s^2"} />
				<Card title={"Test"} value={40} unit={"m/s^2"} />
			</div>

			<div className="text-center text-4xl font-medium my-10">
				<Chart />
			</div>
		</div>
	);
};

export default Data;
