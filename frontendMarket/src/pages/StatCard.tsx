import { Link } from "react-router-dom";

interface StatCardProps {
  title: string;
  count: number;
  linkTo: string;
  linkLabel: string;
}

const StatCard = ({ title, count, linkTo, linkLabel }: StatCardProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-3xl text-green-600">{count}</p>
      <Link to={linkTo} className="text-green-700 hover:underline mt-2 inline-block">
        {linkLabel}
      </Link>
    </div>
  );
};

export default StatCard;