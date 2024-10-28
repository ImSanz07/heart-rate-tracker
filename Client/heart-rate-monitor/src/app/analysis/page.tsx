"use client"

import { useState, useEffect } from "react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface HeartRateData {
    label: string
    heartRate: number
}

export default function HeartRateAnalysis() {
    const [data, setData] = useState<HeartRateData[]>([])
    const [range, setRange] = useState<string>("day")
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/getHeartRateHistory?range=${range}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch data");
                }
                const result = await response.json();
                if (!Array.isArray(result)) {  // Check if result is an array
                    throw new Error("Invalid data format received");
                }
                setData(result);
            } catch (err) {
                setError("Error fetching data. Please try again later.");
                setData([]);  // Set data to an empty array to avoid further errors
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [range]);

    // Inside calculateInsights
    const calculateInsights = (data: HeartRateData[]) => {
        if (!Array.isArray(data) || data.length === 0) return null;  // Ensure data is an array and not empty

        const heartRates = data.map(d => d.heartRate);
        const avgHeartRate = Math.round(heartRates.reduce((sum, rate) => sum + rate, 0) / heartRates.length);
        const maxHeartRate = Math.max(...heartRates);
        const minHeartRate = Math.min(...heartRates);


        
        let insight = `Over the past ${range}, your average heart rate was ${avgHeartRate} bpm. `;
        insight += `Your heart rate peaked at ${maxHeartRate} bpm and was as low as ${minHeartRate} bpm. `;
        if (maxHeartRate > 140) {
            insight += `But you have been getting sudden spikes upto ${maxHeartRate}, so be cautious.`;
        }

        if (avgHeartRate < 60) {
            insight += "Your average heart rate is below normal. This could indicate excellent cardiovascular fitness, but if you're experiencing symptoms, please consult a doctor.";
        } else if (avgHeartRate > 100) {
            insight += "Your average heart rate is above normal. This could be due to stress, caffeine, or physical activity. If it persists, consider consulting a doctor.";
        } else {
            insight += "Your average heart rate is within the normal range, indicating good heart health.";
        }

        return insight;
    }


    const insights = calculateInsights(data)

    return (
        <Card className="w-full max-w-4xl">
            <CardHeader>
                <CardTitle>Heart Rate Analysis</CardTitle>
                <CardDescription>Analyzing your heart rate data over time</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <Select value={range} onValueChange={setRange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select time range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="day">Last 24 Hours</SelectItem>
                            <SelectItem value="week">Last Week</SelectItem>
                            <SelectItem value="month">Last Month</SelectItem>
                            <SelectItem value="year">Last Year</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {loading && <p>Loading...</p>}
                {error && (
                    <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {!loading && !error && (
                    <>
                        <ChartContainer
                            config={{
                                heartRate: {
                                    label: "Heart Rate",
                                    color: "hsl(var(--chart-1))",
                                },
                            }}
                            className="h-[400px]"
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="label" />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Legend />
                                    <Line dot={false} type="monotone" dataKey="heartRate" stroke="var(--color-heartRate)" name="Heart Rate" />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                        {insights && (
                            <Alert className="mt-4">
                                <AlertTitle>Insights</AlertTitle>
                                <AlertDescription>{insights}</AlertDescription>
                            </Alert>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}