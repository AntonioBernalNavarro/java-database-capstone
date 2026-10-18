# Curl Tests — Smart Clinic Management System

Base URL: https://antonionbern-8080.theiadockernext-0-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai

## 1. Get all doctors (public)

curl -s https://antonionbern-8080.theiadockernext-0-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/doctor

Expected output: {"doctors":[...25 doctors with availableTimes...]}

## 2. Sign up a new patient

curl -X POST https://antonionbern-8080.theiadockernext-0-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/patient -H "Content-Type: application/json" -d '{"name":"Test Patient","email":"testpatient@example.com","phone":"6009998877","password":"testpass123","address":"Calle Test 123"}'

Expected output: {"message":"Signup successful"}

## 3. Login patient

curl -X POST https://antonionbern-8080.theiadockernext-0-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/patient/login -H "Content-Type: application/json" -d '{"email":"jane.doe@example.com","password":"passJane1"}'

Expected output: {"token":"eyJhbGciOiJIUzI1NiJ9..."}

## 4. Get patient appointments (JWT-authenticated)

curl -i -X GET https://antonionbern-8080.theiadockernext-0-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/patient/1/patient/<JWT-TOKEN> -H "Accept: application/json"

Replace <JWT-TOKEN> with the token returned by the login command above.

Expected output: {"appointments":[...]}

## 5. Filter doctors by specialty and time

curl -X GET https://antonionbern-8080.theiadockernext-0-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/doctor/filter/null/09:00-10:00/Cardiologist

Expected output: {"doctors":[...cardiologists available 09:00-10:00...]}

## 6. Doctor login

curl -X POST https://antonionbern-8080.theiadockernext-0-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/doctor/login -H "Content-Type: application/json" -d '{"email":"dr.adams@example.com","password":"pass12345"}'

Expected output: {"token":"eyJhbGciOiJIUzI1NiJ9..."}

## 7. Admin login

curl -X POST https://antonionbern-8080.theiadockernext-0-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/admin -H "Content-Type: application/json" -d '{"username":"admin","password":"admin@1234"}'

Expected output: {"token":"eyJhbGciOiJIUzI1NiJ9..."}
