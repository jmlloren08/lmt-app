import axios from 'axios';
import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';

export default function BarChart({ valueFilters }) {

    const [chartData, setChartData] = useState({ categories: [], series: [], colors: [] });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {

                const response = await axios.get('/get-account-status-where-filters', {
                    params: valueFilters || null
                });

                const counts = response.data.counts;
                const categories = Object.keys(counts);
                const series = Object.values(counts);

                const statusColors = {
                    'Current': '#007bff', // blue
                    'WRITTEN OFF': '#dc3545', // red
                    'Non Performing Pastdue': '#ffc107', // yellow
                    'Performing Pastdue': '#28a745', // green
                    'New Possible PD': '#17a2b8', // cyan
                    'Possible Non Performing': '#6f42c1', // purple
                    'NTB': '#343a40' // dark gray
                }

                const colors = categories.map(status => statusColors[status] || '#000000');

                setChartData({
                    categories,
                    series: [{
                        name: 'count',
                        data: series
                    }],
                    colors
                });

            } catch (error) {
                console.error('Error fetching data: ', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();

    }, [valueFilters]);

    const options = {
        chart: {
            type: 'bar',
            height: 350
        },
        plotOptions: {
            bar: {
                horizontal: true,
                endingShape: 'rounded',
                distributed: true
            }
        },
        colors: chartData.colors,
        dataLabels: {
            enabled: true
        },
        xaxis: {
            categories: chartData.categories
        },
        yaxis: {
            title: {
                text: 'Count'
            }
        },
        fill: {
            opacity: 1
        },
        tooltip: {
            y: {
                formatter: function (val) {
                    return val;
                }
            }
        }
    }

    if (loading) {
        return (
            <div className="p-4 w-full">
                <div className="animate-pulse flex space-x-4">
                    <div className="rounded-full bg-slate-200 h-10 w-10"></div>
                    <div className="flex-1 space-y-6 py-1">
                        <div className="h-2 bg-slate-200 rounded"></div>
                        <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                                <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                            </div>
                            <div className="h-2 bg-slate-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {chartData.series && Array.isArray(chartData.series) && chartData.series.some((series) => Array.isArray(series.data) && series.data.some((value) => (value > 0))) ? (
                <ReactApexChart
                    options={options}
                    series={chartData.series}
                    type='bar'
                    height={350}
                />
            ) : (
                <p className='text-center text-gray-500'>No data found.</p>
            )}
        </>
    );
}
