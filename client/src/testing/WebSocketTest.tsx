import { useState, useEffect } from "react";

const WebSocketTest = () => {
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
		<div className="text-center m-10">
			<h1 className="text-4xl font-medium">WebSocketTest</h1>

			<p className="m-5">{message}</p>
		</div>
	);
};

export default WebSocketTest;
