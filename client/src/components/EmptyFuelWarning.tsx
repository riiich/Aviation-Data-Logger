import { LuFuel } from "react-icons/lu";

const EmptyFuelWarning = () => {
	return (
		<div className="text-center border p-3 bg-black rounded-md text-6xl w-[70%] animate-scale-pulse">
			<h1 className="flex justify-center items-center gap-10 text-amber-300 p-5">
				NO FUEL
				<span className=""><LuFuel /></span>
			</h1>
		</div>
	);
};

export default EmptyFuelWarning;
