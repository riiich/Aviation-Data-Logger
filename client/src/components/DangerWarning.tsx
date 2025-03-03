import { useEffect, useRef } from "react";
import dangerSound from "../assets/warning-sound.mp3";

const DangerWarning = () => {
	const audioRef = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		audioRef.current = new Audio(dangerSound);

		// if(audioRef.current){
		// 	audioRef.current.play();
		// 	audioRef.current.loop = true;
		// 	audioRef.current.volume = 0.2;
		// } 
	}, []);

	const playAudio = () => {
		if(audioRef.current) {
			audioRef.current.play();
			audioRef.current.loop = true;
			audioRef.current.volume = 0.2;
		}
	}

	return (
		<div className="text-center border border-slate-200 rounded-md bg-black text-6xl p-3 w-[70%] animate-scale-pulse">
			<h1 className="text-red-500 p-5">DANGER!!!</h1>

			<audio ref={audioRef} src={dangerSound}  />

			<p className="border-t slate-300 text-2xl mt-2 p-2 text-white">
				Dangerously close to object ahead!
			</p>
		</div>
	);
};

export default DangerWarning;
