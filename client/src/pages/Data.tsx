import { useState, useEffect } from "react";
import Card from "../components/Card";
import MapLocation from "../components/Map";
import AudioEffect from "../components/AudioEffect";
import DangerWarning from "../components/DangerWarning";
import dangerAudio from "../assets/warning-sound.mp3";
import EmptyFuelWarning from "../components/EmptyFuelWarning";
import emptyFuelAudio from "../assets/propeller.mp3";
import { FaPlaneDeparture } from "react-icons/fa";
import { IoMdSpeedometer } from "react-icons/io";
import { PiSpeedometerLight } from "react-icons/pi";
import { FaLocationDot } from "react-icons/fa6";
import { FaTemperatureLow } from "react-icons/fa";
import { BsFillFuelPumpFill } from "react-icons/bs";

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
		fuel: 0,
		distanceFromObject: 0,
		source: "",
		vehicleHealth: "",
	});
	const [tooClose, setTooClose] = useState(false);
	const [emptyFuel, setEmptyFuel] = useState(false);

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

				setSensorData((prev) => ({
					...prev,
					acceleration: data.acceleration ? data.acceleration.toFixed(2) : 0,
					altitude: data.altitude ? data.altitude.toFixed(0) : 0,
					speed: data.speed ? data.speed.toFixed(0) : 0,
					temperature: data.temperature_in_celsius,
					coordinates: {
						latitude: data.latitude ? data.latitude : 0,
						longitude: data.longitude ? data.longitude : 0,
						// latitude: data.latitude ? data.latitude.toFixed(5) : prev.coordinates.latitude,
						// longitude: data.longitude ? data.longitude : prev.coordinates.longitude,
					},
					fuel: data.fuel,
					distanceFromObject: data.distanceFromObjectInFt
						? data.distanceFromObjectInFt.toFixed(2)
						: 0,
					source: data.source,
				}));

				if (data.distanceFromObjectInFt <= 0.3) setTooClose(true);
				else setTooClose(false);

				if (data.fuel === 0) setEmptyFuel(true);
				else setEmptyFuel(false);

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
				<Card
					title={"Coordinates"}
					value={0}
					coordinates={sensorData.coordinates}
					unit={""}
					type="coordinates"
					icon={FaLocationDot}
				/>
				<Card
					title={"Temperature"}
					value={sensorData.temperature}
					unit={"°C"}
					type="temperature"
					icon={FaTemperatureLow}
				/>
				<Card
					title={"Fuel"}
					value={sensorData.fuel}
					unit={""}
					type="fuel"
					icon={BsFillFuelPumpFill}
				/>
			</div>

			<p>{sensorData.distanceFromObject}</p>
			{tooClose && (
				<div className="fixed inset-0 flex justify-center items-center backdrop-blur-md z-40">
					<AudioEffect condition={tooClose} audioURL={dangerAudio} infiniteLoop={true} />
					<DangerWarning />
				</div>
			)}

			{emptyFuel && (
				<div className="fixed inset-0 flex justify-center items-center backdrop-blur-md z-39">
					<AudioEffect condition={emptyFuel} audioURL={emptyFuelAudio} infiniteLoop={false} />
					<EmptyFuelWarning />
				</div>
			)}

			{/* <div className="text-center text-4xl font-medium my-10">
				<Chart />
			</div> */}

			<h2 className="text-white text-center m-13 text-4xl font-medium">Current Location</h2>
			<div className="flex justify-center">
				<MapLocation lat={sensorData.coordinates.latitude} lon={sensorData.coordinates.longitude} />
			</div>
		</div>
	);
};

export default Data;
