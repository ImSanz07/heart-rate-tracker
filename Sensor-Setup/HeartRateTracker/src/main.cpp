#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <Arduino.h>
#include <HTTPClient.h>
#include <WiFi.h>
#include <DHT.h>
#include <PubSubClient.h>

#define lcd_ADDR 0x27
#define lcd_COLUMNS 16
#define lcd_ROWS 2

LiquidCrystal_I2C lcd(lcd_ADDR, lcd_COLUMNS, lcd_ROWS);

#define PULSE_PIN 35

#define redLEDPin 12
#define greenLEDPin 14

int minHeartRate = 60;
int maxHeartRate = 100;
const char *ssid = "Wokwi-GUEST"; // Your Wi-Fi SSID
const char *password = "";        // Your Wi-Fi password
const char *serverUrl = "http://192.168.32.78:4000/sensor/heartbeat";

void setup(){
  Serial.begin(9600);
  lcd.init();
  lcd.backlight();
  Wire.begin(23, 22);
  lcd.print("Heart Monitor");
  pinMode(redLEDPin, OUTPUT);
  pinMode(greenLEDPin, OUTPUT);

  WiFi.begin(ssid, password);

  // Seed the random number generator with a unique value
  randomSeed(analogRead(0));

  // Attempt to connect to WiFi
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("Connected!");
}

void loop()
{
  int pulseValue = analogRead(13);
  int pulseRate = map(pulseValue, 0, 4098, 0, 200); // assuming pulse range 60-180 bpm

  if (WiFi.status() == WL_CONNECTED)
  {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(10000); // Set timeout to 10 seconds

    // Generate a random heart rate value between 60 and 100 bpm
    int heartRate = random(60, 101);
    String jsonPayload = "{\"heartRate\": " + String(heartRate) + "}";

    int httpResponseCode = http.POST(jsonPayload);

    if (httpResponseCode > 0)
    {
      String response = http.getString();
      Serial.print("Response code: ");
      Serial.println(httpResponseCode);
      Serial.print("Response: ");
      Serial.println(response);
    }
    else
    {
      Serial.print("Error on HTTP request: ");
      Serial.println(httpResponseCode);
      Serial.print("WiFi Status: ");
      Serial.println(WiFi.status()); // Print Wi-Fi status
    }

    http.end();
    if (heartRate < minHeartRate)
    {
      lcd.clear();
      lcd.print("Heart rate below ");
      lcd.setCursor(0, 1);
      lcd.print("minimum: ");
      lcd.println(heartRate);
      lcd.setCursor(13, 1);
      lcd.print("b/m");
      digitalWrite(redLEDPin, HIGH); // Turn on LED
      delay(20);                     // Wait for half of the blink interval
      digitalWrite(redLEDPin, LOW);  // Turn off LED
      delay(20);                     // Wait for the other half of the blink interval
    }
    else if (heartRate > maxHeartRate)
    {
      lcd.clear();
      lcd.print("Heart rate above ");
      lcd.setCursor(0, 1);
      lcd.print("maximum: ");
      lcd.println(heartRate);
      lcd.setCursor(13, 1);
      lcd.print("b/m");
      digitalWrite(redLEDPin, HIGH); // Turn on LED
      delay(20);                     // Wait for half of the blink interval
      digitalWrite(redLEDPin, LOW);  // Turn off LED
      delay(20);                     // Wait for the other half of the blink interval
    }
    else
    {
      lcd.clear();

      lcd.println("Heart Monitor");
      lcd.setCursor(0, 1);
      lcd.print("Heart rate:");
      lcd.println(heartRate);
      lcd.setCursor(13, 1);
      lcd.println("b/m");
      digitalWrite(greenLEDPin, HIGH); // Turn on LED
      delay(100);                      // Wait for half of the blink interval
      digitalWrite(greenLEDPin, LOW);  // Turn off LED
      delay(100);                      // Wait for the other half of the blink interval
    }
  }
  else
  {
    Serial.println("WiFi not connected");
  }

  delay(5000); // Wait for 5 seconds before the next request // adjust for realistic reading frequency
} 