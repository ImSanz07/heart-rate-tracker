'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Activity, Flame, Clock, BarChart, Heart, HeartPulse } from 'lucide-react'
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import HeartRateHistory from './HeartRateHistory'
import WalkMap from './WalkMap'

function getHeartRateZone(heartRate: number): string {
    if (heartRate < 70) return 'Rest'
    if (heartRate < 100) return 'Fat Burn'
    if (heartRate < 140) return 'Cardio'
    return 'Peak'
}

function getZoneColor(zone: string): string {
    switch (zone) {
        case 'Rest': return 'text-blue-400'
        case 'Fat Burn': return 'text-green-400'
        case 'Cardio': return 'text-yellow-400'
        case 'Peak': return 'text-red-400'
        default: return 'text-gray-400'
    }
}

const tips = [
    "Stay hydrated! Drink water regularly throughout your workout.",
    "Remember to warm up before intense exercise to prevent injury.",
    "Cool down and stretch after your workout to improve flexibility.",
    "Aim for at least 150 minutes of moderate aerobic activity weekly.",
    "Listen to your body and rest when needed to avoid overtraining.",
]

export default function Component() {
    const [heartRate, setHeartRate] = useState(70)
    const [heartRateHistory, setHeartRateHistory] = useState<{ time: string, rate: number }[]>([])
    const [elapsedTime, setElapsedTime] = useState(0)
    const [averageHeartRate, setAverageHeartRate] = useState(0)
    const [maxHeartRate, setMaxHeartRate] = useState(0)
    const [caloriesBurned, setCaloriesBurned] = useState(0)
    const [currentTip, setCurrentTip] = useState(tips[0])
    const [timeRange, setTimeRange] = useState('hour')

    useEffect(() => {
        const fetchHeartRate = async () => {
            try {
                const response = await fetch('/api/getHeartRate')
                const data = await response.json()
                const newRate = data.heartRate
                if (newRate !== heartRate) {
                setHeartRate(newRate)
                setHeartRateHistory(prev => {
                    const newHistory = [...prev, { time: new Date().toLocaleTimeString(), rate: newRate }]
                    const filteredHistory = timeRange === 'hour' ? newHistory.slice(-180) : newHistory.slice(-1440)
                    return filteredHistory
                })
                updateStats(newRate)    
                }
                
            } catch (error) {
                console.error('Error fetching heart rate:', error)
            }
        }

        const updateStats = (newRate: number) => {
            setAverageHeartRate(prev => Math.round((prev + newRate) / 2))
            setMaxHeartRate(prev => Math.max(prev, newRate))
            setCaloriesBurned(prev => prev + (newRate * 0.05)) // Simple estimation
        }

        fetchHeartRate() // Initial fetch
        const interval = setInterval(fetchHeartRate, 10000) // Fetch every 2 seconds

        const tipInterval = setInterval(() => {
            setCurrentTip(prev => {
                const currentIndex = tips.indexOf(prev)
                return tips[(currentIndex + 1) % tips.length]
            })
        }, 10000) // Change tip every 10 seconds

        const timeInterval = setInterval(() => {
            setElapsedTime(prev => prev + 1)
        }, 1000) // Increment time every second

        return () => {
            clearInterval(interval)
            clearInterval(tipInterval)
            clearInterval(timeInterval)
        }
    }, [timeRange,heartRate])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const zone = getHeartRateZone(heartRate)
    const zoneColor = getZoneColor(zone)

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className='flex justify-center'>
                    <HeartPulse className='mt-2 mr-5' />
                    <div>
                        <h1 className="text-4xl font-bold mb-2 text-white">Dil Dhadakne Do</h1>
                        <p className="text-gray-300">Let your heart be healthy for longer</p>
                    </div>
                </div>


                <div>
                    <h1>Live Heartrate Feed</h1>
                </div>
                <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
                    <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <div className="relative">
                                    <Heart className={`w-32 h-32 ${zoneColor} animate-pulse`} />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className={`text-5xl font-bold ${zoneColor}`}>{heartRate}</span>
                                    </div>
                                </div>
                                <div className="text-2xl font-light text-white">BPM</div>
                                <div className={`text-3xl font-semibold ${zoneColor}`}>
                                    {zone}
                                </div>
                                <div className="flex items-center space-x-2 text-gray-300">
                                    <Clock className="w-5 h-5" />
                                    <span className="text-lg">{formatTime(elapsedTime)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="lg:col-span-2 bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="md:h-90">
                                <ChartContainer
                                    className='h-[350px] w-full pr-5'
                                    config={{
                                        rate: {
                                            label: "Heart Rate",
                                            color: "hsl(var(--chart-1))",
                                        },
                                    }}
                                >
                                    <ResponsiveContainer width="90%" height="90%">
                                        <LineChart data={heartRateHistory}>
                                            <XAxis
                                                dataKey="time"
                                                tick={{ fill: '#9CA3AF' }}
                                                interval="preserveStartEnd"
                                                tickFormatter={(value) => value}
                                                label={{ value: "Time", position: "insideBottom", offset: -3, fill: '#9CA3AF' }}
                                            />
                                            <YAxis 
                                                label={{ value: "BPM", angle: -90, position: "insideLeft", fill: '#9CA3AF' }}
                                                domain={[40, 200]}
                                                tick={{ fill: '#9CA3AF' }}
                                            />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Line
                                                type="monotone"
                                                dataKey="rate"
                                                stroke="url(#colorGradient)"
                                                strokeWidth={2}
                                                dot={{
                                                    fill: "url(#colorGradient)",
                                                }}
                                            />
                                            <defs>
                                                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.8} />
                                                </linearGradient>
                                            </defs>
                                        </LineChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <HeartRateHistory />
                </div>
                <div>
                    <WalkMap />
                </div>




                <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                        <CardContent className="p-6 space-y-4">
                            <h2 className="text-xl font-semibold mb-4 text-white">Statistics</h2>
                            <div className="flex justify-between items-center text-gray-300">
                                <span className="flex items-center"><Activity className="w-5 h-5 mr-2" /> Average Rate</span>
                                <span className="font-bold">{averageHeartRate} BPM</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-300">
                                <span className="flex items-center"><BarChart className="w-5 h-5 mr-2" /> Max Rate</span>
                                <span className="font-bold">{maxHeartRate} BPM</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-300">
                                <span className="flex items-center"><Flame className="w-5 h-5 mr-2" /> Calories Burned</span>
                                <span className="font-bold">{Math.round(caloriesBurned)} kcal</span>
                            </div>
                            
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                        <CardContent className="p-6 space-y-4">
                            <h2 className="text-xl font-semibold mb-4 text-white">Zone Time</h2>
                            <div>
                                <div className="flex justify-between mb-1 text-gray-300 ">
                                    <span>Rest</span>
                                    <span>30%</span>
                                </div>
                                <Progress value={30} className="h-2 bg-gray-700 [&>*]:bg-blue-600" />
                            </div>
                            <div>
                                <div className="flex justify-between mb-1 text-gray-300">
                                    <span>Fat Burn</span>
                                    <span>40%</span>
                                </div>
                                <Progress value={40} className="h-2 bg-gray-700 [&>*]:bg-green-600" />
                            </div>
                            <div>
                                <div className="flex justify-between mb-1 text-gray-300">
                                    <span>Cardio</span>
                                    <span>25%</span>
                                </div>
                                <Progress value={25} className="h-2 bg-gray-700 [&>*]:bg-yellow-600" />
                            </div>
                            <div>
                                <div className="flex justify-between mb-1 text-gray-300">
                                    <span>Peak</span>
                                    <span>5%</span>
                                </div>
                                <Progress value={5} className="h-2 bg-gray-700 [&>*]:bg-orange-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <h2 className="text-xl font-semibold mb-4 text-white">Health Tip</h2>
                            <p className="text-gray-300 italic">{currentTip}</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}