import { useState, useEffect, useRef } from "react";

interface AudioEffectProps {
	condition: boolean;
	audioURL?: string;
	infiniteLoop: boolean;
}

const AudioEffect: React.FC<AudioEffectProps> = ({ condition, audioURL, infiniteLoop }) => {
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [audioIsPlaying, setAudioIsPlaying] = useState<boolean>(false);

	useEffect(() => {
		// create an audio element if it doesn't already exist
		if (!audioRef.current) {
			audioRef.current = new Audio(audioURL);
			audioRef.current.loop = infiniteLoop;
		}

		return () => {
			if (audioRef.current) {
				audioRef.current.pause();
				audioRef.current = null;
			}
		};
	}, [audioURL]);

	// handle condition changes
	useEffect(() => {
		// play the audio IF the object IS too close AND the audio is currently not playing AND there is an existing audio reference
		if (condition && !audioIsPlaying && audioRef.current) {
			audioRef.current
				.play()
				.then(() => {
					console.log("audio successfully playing!");
					setAudioIsPlaying(true);
				})
				.catch((e: unknown) => {
					console.error("there was an error playing the audio: ", e);
				});
		}
		// stop the audio IF the object IS NOT too close AND the audio is currently playing AND there is an existing audio reference
		else if (!condition && audioIsPlaying && audioRef.current) {
			audioRef.current.pause();
			setAudioIsPlaying(false);
		}
	}, [condition, audioIsPlaying]);

	return <></>;
};

export default AudioEffect;
