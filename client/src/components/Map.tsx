import { useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { APIProvider, Map, Pin, InfoWindow, AdvancedMarker } from "@vis.gl/react-google-maps";

interface MapProp {
	lat: number;
	lon: number;
}

const MapLocation = ({ lat, lon }: MapProp) => {
	const currentPosition = { lat: lat, lng: lon };

	return (
		<APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
			<div style={{ height: "50vh", width: "50%" }}>
				<Map defaultZoom={20} center={currentPosition}  mapId={import.meta.env.VITE_GOOGLE_MAPS_ID} colorScheme="FOLLOW_SYSTEM">
					<AdvancedMarker position={currentPosition}></AdvancedMarker>
				</Map>
			</div>
		</APIProvider>
	);
};

export default MapLocation;
