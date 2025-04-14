import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import Spinner from '../Spinner';

export default function PieChart({ valueFilters }) {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/get-count-borrowers-where-filters', {
                params: valueFilters || null
            });
            setData(response.data);
        } catch (error) {
            console.error('Error fetching data: ', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, [valueFilters]);

    const chartOptions = {
        chart: {
            type: 'pie'
        },
        labels: ['Existing Borrower', 'Non-Borrower'],
        responsive: [{
            breakpoint: 480,
            options: {
                chart: {
                    width: 200
                },
                legend: {
                    position: 'bottom'
                }
            }
        }]
    }

    const chartSeries = [data.existing_borrower || 0, data.non_borrower || 0];

    return (
        <>
            {loading ? (
                <Spinner />
            ) : data ? (
                <ReactApexChart
                    options={chartOptions}
                    series={chartSeries}
                    type="pie"
                    height={350}
                />
            ) : (
                <p className='text-center text-gray-500'>No data available</p>
            )}
        </>
    );
}
