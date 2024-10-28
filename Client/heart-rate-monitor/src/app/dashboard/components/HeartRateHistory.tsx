"use client"

import { useState, useEffect } from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { RefreshCcw } from "lucide-react"
import { time } from "console"

const chartConfig = {
    heartRate: {
        label: "Heart Rate",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig

const fetchHeartRateData = async (range: 'day' | 'week' | 'month' | 'year') => {
    try {
        const response = await fetch(`/api/getHeartRateHistory?range=${range}`);
        if (!response.ok) {
            throw new Error('Failed to fetch heart rate data');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching heart rate data:', error);
        return []; // Return an empty array on error
    }
};

export default function HeartRateHistory() {
    const [range, setRange] = useState<'day' | 'week' | 'month' | 'year'>('day');
    const [chartData, setChartData] = useState<any[]>([]); // Initialize as an empty array
    const [reload, setReload] = useState(false); // Initialize as false
    const [isReloading, setIsReloading] = useState(false); // Track reload animation

    // Fetch initial data on component mount
    useEffect(() => {
        const fetchData = async () => {
            const data = await fetchHeartRateData(range);
            setChartData(data); // Update state with fetched data
        };
        fetchData();
        setIsReloading(false);
    }, [range, reload]); // Re-fetch data when range changes

    const handleRangeChange = async (newRange: typeof range) => {
        setRange(newRange);
        // No need to call fetchHeartRateData again here as useEffect will handle it
    };
    const handleReload = () => {
        setIsReloading(true);
        setTimeout(() => {
            setReload(!reload);
            // Stop animation after 2 seconds
        }, 950);

        console.log('Reloading...');
        // Toggle reload state to trigger re-fetch
    };

    return (
        <div className="flex justify-center">
            <Card className="text-white w-[1250px] bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader className="text-white">
                    <div className="flex justify-between">
                        <CardTitle>Heart Rate History</CardTitle>
                        <Button variant="secondary" onClick={handleReload} >
                            <RefreshCcw className={isReloading ? "animate-spin" : ""} />
                        </Button>
                    </div>
                    <CardDescription>Average heart rate over time</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="w-[1150px] h-[300px]">
                        <LineChart
                            data={chartData}
                            margin={{
                                top: 5,
                                right: 0,
                                left: 0,
                                bottom: 0,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="label"
                                stroke="#9CA3AF"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                interval={range === 'day' ? 'preserveStartEnd' : 0}
                                tickFormatter={(value) => range === 'day' ? value : value.slice(0, 3)}
                            />
                            <YAxis
                                stroke="#9CA3AF"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                domain={[40, 200]}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line
                                type="monotone"
                                dataKey="heartRate"
                                stroke="var(--color-heartRate)"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
                <CardFooter className="flex justify-between">
                    {['day', 'week', 'month', 'year'].map((item) => (
                        <Button
                            key={item}
                            variant={range === item ? 'secondary' : 'ghost'}
                            onClick={() => handleRangeChange(item as 'day' | 'week' | 'month' | 'year')}
                        >
                            {item.charAt(0).toUpperCase() + item.slice(1)}
                        </Button>
                    ))}
                </CardFooter>
            </Card>
        </div>
    );
}