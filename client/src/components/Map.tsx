import { useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

interface MapProp {
	lat: number;
	lon: number;
}

const containerStyle = {
	width: "500px",
	height: "500px",
};

const Map = ({ lat, lon }: MapProp) => {
	return <></>;
};

export default Map;
