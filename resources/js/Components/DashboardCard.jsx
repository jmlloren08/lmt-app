import { Link } from '@inertiajs/react';
import Spinner from './Spinner';

export default function DashboardCard({ title, count, loading, link, bgColor }) {
    return (
        <div className={`text-white ${bgColor} p-4 shadow rounded-lg`}>
            <h3 className="text-lg">{title}</h3>
            <Link href={link}>
                <p className='text-5xl font-bold hover:underline'>{loading ? <Spinner /> : count}</p>
            </Link>
        </div>
    );
}