import Card from "../components/Card";
import Chart from "../components/Chart";

const Data = () => {
	return (
		<div className="p-5">
			<h2 className="text-center text-4xl font-medium mb-5">Avionic Data</h2>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
				<Card title={"Acceleration"} value={40} unit={"m/s^2"} />
				<Card title={"Altitude"} value={40} unit={"m/s^2"} />
				<Card title={"Speed"} value={40} unit={"m/s^2"} />
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
