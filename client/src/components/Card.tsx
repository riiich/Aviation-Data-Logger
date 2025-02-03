interface CardType {
	title: string;
	value: number;
	unit: string;
}

const Card = ({ title, value, unit }: CardType) => {
	return (
		<div className="border m-3 p-3 rounded-md w-sm">
			<h2 className="text-xl font-mono">{title}</h2>
            <p>{value} {unit}</p>
		</div>
	);
};

export default Card;
