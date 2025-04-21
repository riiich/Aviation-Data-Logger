const DangerWarning = () => {
	return (
		<div className="text-center border border-slate-200 rounded-md bg-black text-6xl p-3 w-[70%] animate-scale-pulse">
			<h1 className="text-red-500 p-5">DANGER!!!</h1>

			{/* <audio ref={audioRef} src={dangerSound}  /> */}

			<p className="border-t slate-300 text-2xl mt-2 p-2 text-white">
				Dangerously close to object ahead!
			</p>
		</div>
	);
};

export default DangerWarning;
