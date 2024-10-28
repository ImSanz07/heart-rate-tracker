import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";

interface HeartRateData {
    label: string;
    heartRate: number;
}

interface InsightsData {
    normal_rate: number;
    abnormal_rate: number;
    insights: string;
}

export default function HeartRateAnalysis() {
    const [data, setData] = useState<HeartRateData[]>([]);
    const [range, setRange] = useState<string>("day");
    const [insights, setInsights] = useState<InsightsData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/getHeartRate?range=${range}`);
                const result = await response.json();
                setData(result);
                const insightsResponse = await fetch(`/api/analyzeHeartRate`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(result),
                });
                const insightsResult = await insightsResponse.json();
                setInsights(insightsResult);
            } catch (err) {
                setError("Error fetching data. Please try again later.");
                setData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [range]);

    return (
        <Card className="w-full max-w-4xl">
            {/* UI Code */}
            {insights && (
                <Alert className="mt-4">
                    <AlertTitle>Insights</AlertTitle>
                    <AlertDescription>{insights.insights}</AlertDescription>
                </Alert>
            )}
        </Card>
    );
}
