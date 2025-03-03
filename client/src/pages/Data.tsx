import { useState, useEffect } from "react";
import Card from "../components/Card";
import Chart from "../components/Chart";
import DangerWarning from "../components/DangerWarning";
import MapLocation from "../components/Map";

const Data = () => {
	const [socket, setSocket] = useState<WebSocket | null>(null);
	const [sensorData, setSensorData] = useState({
		acceleration: 0,
		altitude: 0,
		speed: 0,
		temperature: 0,
		coordinates: {
			latitude: 34.15,
			longitude: -118.217839,
		},
		distanceFromObject: 0,
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
				// console.log("Message from server:", data);
				setSensorData({
					...sensorData,
					acceleration: data.acceleration.toFixed(2),
					altitude: data.altitude.toFixed(0),
					speed: data.speed.toFixed(0),
					coordinates: {
						latitude: data.latitude,
						longitude: data.longitude,
					},
					distanceFromObject: data.distanceFromObjectInFt.toFixed(2),
					source: data.source,
				});
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
		console.log("socket: ", socket);

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
			</div>

			{sensorData.distanceFromObject < 1 && (
				<div className="fixed inset-0 flex justify-center items-center backdrop-blur-md z-40">
					<DangerWarning />
				</div>
			)}

			<div className="text-center text-4xl font-medium my-10">
				<Chart />
			</div>

			<h2 className="text-center m-13 text-4xl font-medium">Current Location</h2>
			<div className="flex justify-center">
				<MapLocation lat={sensorData.coordinates.latitude} lon={sensorData.coordinates.longitude} />
			</div>
		</div>
	);
};

export default Data;
