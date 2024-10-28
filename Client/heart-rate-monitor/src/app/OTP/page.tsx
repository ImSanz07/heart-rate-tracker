'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function OTPSender() {
    const [phoneNumber, setPhoneNumber] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [isError, setIsError] = useState(false)

    const sendOTP = async () => {
        if (!phoneNumber) {
            setMessage("Please enter a phone number")
            setIsError(true)
            return
        }

        setIsLoading(true)
        setMessage('')
        setIsError(false)

        try {
            const response = await fetch('/api/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phoneNumber }),
            })

            const data = await response.json()

            if (response.ok) {
                setMessage("OTP sent successfully!")
                setIsError(false)
            } else {
                throw new Error(data.error || 'Failed to send OTP')
            }
        } catch (error) {
            setMessage(error.message)
            setIsError(true)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-md w-96">
                <h1 className="text-2xl font-bold mb-6 text-center">Send OTP</h1>
                <div className="space-y-4">
                    <Input
                        type="tel"
                        placeholder="Enter phone number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full"
                    />
                    <Button
                        onClick={sendOTP}
                        disabled={isLoading}
                        className="w-full"
                    >
                        {isLoading ? 'Sending...' : 'Send OTP'}
                    </Button>
                    {message && (
                        <p className={`text-center ${isError ? 'text-red-500' : 'text-green-500'}`}>
                            {message}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}