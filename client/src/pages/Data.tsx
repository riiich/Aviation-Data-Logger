import { useState, useEffect } from "react";
import Card from "../components/Card";
import Chart from "../components/Chart";
import Map from "../components/Map";

const Data = () => {
	const [message, setMessage] = useState("");
	const [socket, setSocket] = useState<WebSocket | null>(null);
	const [sensorData, setSensorData] = useState({
		acceleration: 0,
		altitude: 0,
		speed: 0,
		temperature: 0,
		coordinates: {
			latitude: 34.074284, 
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
				console.log("Message from server:", data);
				setMessage(data.message);
				setSensorData({
					...sensorData,
					acceleration: data.acceleration.toFixed(2),
					altitude: data.altitude.toFixed(0),
					speed: data.speed.toFixed(0),
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

		// Clean up on component unmount
		return () => {
			ws.close();
		};
	}, []);

	const getLocation = async () => {
		try {
			const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${sensorData.coordinates.latitude},${sensorData.coordinates.longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`);
			const data = await res.json();

			// console.log("coordinates in object: ", sensorData.coordinates.latitude, sensorData.coordinates.longitude);
			// console.log("Google Maps Data: ", data);
		}	
		catch(err) {
			console.log(err);
		}
	};

	return (
		<div className="p-5">
			<h2 className="text-center text-4xl font-medium mb-5">Avionic Data</h2>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
				<Card title={"Acceleration"} value={sensorData.acceleration} unit={"km/hr/s"} />
				<Card title={"Altitude"} value={sensorData.altitude} unit={"ft"} />
				<Card title={"Speed"} value={sensorData.speed} unit={"m/s"} />
			</div>

			<p className="bg-red-600">{sensorData.distanceFromObject < 1.5 ? "Danger" : ""}</p>

			<div className="text-center text-4xl font-medium my-10">
				<Chart />
			</div>

			<>
				<Map lat={sensorData.coordinates.latitude} lon={sensorData.coordinates.longitude} />
			</>

			<button onClick={getLocation} className="border rounded-md p-3 bg-slate-200">Get Location</button>
		</div>
	);
};

export default Data;
