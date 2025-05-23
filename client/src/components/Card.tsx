import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { IconType } from "react-icons";

interface CardType {
	title: string;
	value: number;
	coordinates?: { latitude: number; longitude: number };
	unit: string;
	type?: string;
	icon?: IconType;
}

function cn(...inputs: unknown[]) {
	return twMerge(clsx(inputs));
}

const Card = ({ title, value, coordinates, unit, type, icon: Icon }: CardType) => {
	const cardBackgroundColor = () => {
		if (type === "acceleration") return value > 5 ? "bg-green-300" : "bg-red-500";
		if (type === "altitude") return value > 34500 ? "bg-green-300" : "bg-red-500";
		if (type === "speed") return value > 860 ? "bg-green-300" : "bg-red-500";

		if (type === "fuel") {
			if (value < 420 && value >= 420) return "bg-green-300";
			else if (value < 280 && value >= 75) return "bg-yellow-300";
			else return "bg-red-500";
		}
	};

	return (
		<div
			className={cn(
				"border border-slate-200 bg-slate-400 shadow-md m-3 p-3 rounded-md duration-200 hover:-translate-y-1 w-auto md:w-80 lg:w-lg",
				cardBackgroundColor()
			)}
		>
			<div className="flex justify-between items-center mr-4">
				<h2 className="text-xl font-mono">{title}</h2>
				{Icon && <Icon className="text-2xl" />}
			</div>
			{value !== 0 ? (
				<p>
					<b className="text-3xl">{value ? value : 0}</b> <span className="text-black">{unit}</span>
				</p>
			) : type === "fuel" ? (
				<p>
					<b className="text-3xl">0</b>
				</p>
			) : (
				<p>
					<b className="text-xl">
						{coordinates?.latitude}, {coordinates?.longitude}
					</b>{" "}
					<span className="text-black">{}</span>
				</p>
			)}
		</div>
	);
};

export default Card;
