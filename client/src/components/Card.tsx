interface CardType {
	title: string;
	value: number;
	unit: string;
}

const Card = ({ title, value, unit }: CardType) => {
	return (
		<div className="border border-gray-300 shadow-md m-3 p-3 rounded-md w-auto md:w-80 lg:w-lg">
			<h2 className="text-xl font-mono">{title}</h2>
            <p><b>{value ? value : 0}</b> {unit}</p>
		</div>
	);
};

export default Card;
