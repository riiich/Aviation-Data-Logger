import { useState, useEffect } from "react";
import Card from "../components/Card";
import Chart from "../components/Chart";
import DangerWarning from "../components/DangerWarning";
import MapLocation from "../components/Map";
import DangerSound from "../components/DangerSound";
import dangerAudio from "../assets/warning-sound.mp3";
import { FaPlaneDeparture } from "react-icons/fa";
import { IoMdSpeedometer } from "react-icons/io";
import { PiSpeedometerLight } from "react-icons/pi";

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
	const [tooClose, setTooClose] = useState(false);

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

				setSensorData(prev => ({
					...prev,
					acceleration: data.acceleration ? data.acceleration.toFixed(2) : 0,
					altitude: data.altitude ? data.altitude.toFixed(0) : 0,
					speed: data.speed ? data.speed.toFixed(0) : 0,
					coordinates: {
						latitude: data.latitude || prev.coordinates.latitude,
						longitude: data.longitude || prev.coordinates.longitude,
					},
					distanceFromObject: data.distanceFromObjectInFt ? data.distanceFromObjectInFt.toFixed(2) : 0,
					source: data.source,
				}));

				if (data.distanceFromObjectInFt < 0.3) 
					setTooClose(true);
				else 
					setTooClose(false);

				console.log(data);
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
			<div className="text-white">
				<h2 className="text-center text-4xl font-medium mb-5">Aviation Dashboard</h2>
				<p>Real-time Flight Data Monitoring</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
				<Card
					title={"Acceleration"}
					value={sensorData.acceleration}
					unit={"km/hr/s"}
					type="acceleration"
					icon={PiSpeedometerLight}
				/>
				<Card
					title={"Altitude"}
					value={sensorData.altitude}
					unit={"ft"}
					type="altitude"
					icon={FaPlaneDeparture}
				/>
				<Card
					title={"Speed"}
					value={sensorData.speed}
					unit={"m/s"}
					type="speed"
					icon={IoMdSpeedometer}
				/>
			</div>

			<p>{sensorData.distanceFromObject}</p>
			{tooClose && (
				<div className="fixed inset-0 flex justify-center items-center backdrop-blur-md z-40">
					<DangerWarning />
					<DangerSound condition={tooClose} audioURL={dangerAudio} />
				</div>
			)}

			<div className="text-center text-4xl font-medium my-10">
				<Chart />
			</div>

			<h2 className="text-white text-center m-13 text-4xl font-medium">Current Location</h2>
			<div className="flex justify-center">
				<MapLocation lat={sensorData.coordinates.latitude} lon={sensorData.coordinates.longitude} />
			</div>
		</div>
	);
};

export default Data;
