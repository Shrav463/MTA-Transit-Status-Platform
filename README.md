🚇 MTA Transit Accessibility Status Tracker

1.MTA is a full-stack, cloud-deployed web application that provides real-time elevator and escalator status for NYC subway stations. Built with React and Tailwind CSS on the frontend and a serverless AWS backend using AWS Lambda, API Gateway (HTTP API), and AWS SAM, the application consumes live MTA GTFS data feeds to help users quickly check station accessibility. The frontend is hosted on Amazon S3 as a static website, while the backend is deployed on AWS for scalability, performance, and reliability. The platform includes searchable station listings, detailed status pages, favorites, and an interactive map view, with caching strategies applied to optimize API performance.

🔗 Live Demo:
👉 https://d113m09ugpl61d.cloudfront.net/station/119

🔗 API Base URL:
👉 https://j44rvw6710.execute-api.us-east-1.amazonaws.com/Prod

✨ Features

🔍 Search subway stations by name or ID
♿ View real-time elevator and escalator operational status
🚨 See active and upcoming outage alerts with reasons and ETAs
⚡ Fast, serverless backend using AWS Lambda
🌐 Secure, production-grade frontend deployment using CloudFront
📱 Responsive UI built with modern React + Tailwind CSS

🏗️ Architecture Overview

React (Vite + Tailwind)
        ↓
AWS CloudFront (CDN)
        ↓
Amazon S3 (static hosting)
        ↓
API Gateway (HTTP API)
        ↓
AWS Lambda (Python)
        ↓
MTA Live Elevator & Escalator Feeds


This architecture ensures:

1.high availability
2.low latency
3.minimal infrastructure management
4.secure access to live public transit data

🛠️ Tech Stack

Frontend

1.React (Vite)
2.Tailwind CSS
3.JavaScript (ES6+)
4.HTML5 / CSS3

Backend

1.Python
2.AWS Lambda
3.AWS API Gateway (HTTP API)
4.AWS SAM (Serverless Application Model)
5.Cloud & DevOps
6.Amazon S3 (private bucket)
7.Amazon CloudFront (CDN + HTTPS)
8.IAM (least-privilege access)
9.CloudWatch (logs & monitoring)

Data Source

1.MTA Elevator & Escalator Feeds
2.Equipment feed
3.Outage feed

🔌 API Endpoints
GET /stations

Returns all subway stations with accessibility equipment.

Response (sample):

[
  {
    "id": "119",
    "name": "1 Av",
    "lines": ["L"]
  }
]

GET /status?stationId={id}

Returns real-time elevator and escalator status for a station.

Response (sample):

{
  "elevator_status": "Operational",
  "escalator_status": "Out of Service",
  "alerts": [
    {
      "equipment_id": "EL123",
      "reason": "Maintenance",
      "estimatedreturntoservice": "03/14/2026 05:00 PM"
    }
  ],
  "last_updated": "2026-02-03T19:40:12Z"
}

🚀 Deployment Details

Frontend

1.Built using npm run build
2.Deployed to Amazon S3
3.Served securely via Amazon CloudFront
4.SPA routing handled via CloudFront custom error responses

Backend

1.Deployed using AWS SAM
2.Serverless Lambda functions written in Python
3.Environment variables used for configuration (no hard-coded secrets)

🔐 Security & Best Practices

1.Private S3 bucket (no public access)
2.CloudFront Origin Access Control (OAC)
3.IAM roles with scoped permissions
4.CORS enabled correctly for API access
5.Environment variables used for external configuration

📈 Why This Project Matters

1.This project demonstrates:
2.Real-world use of serverless AWS architecture
3.Integration with live public data APIs
4.Clean separation of frontend and backend
5.Production-ready deployment practices
6.Practical focus on accessibility and usability
7.It was built end-to-end to reflect how modern web applications are designed, deployed, and maintained in industry.

🧩 Future Enhancements

1.Station detail pages with equipment history
2.Map-based visualization
3.Performance optimizations with caching
4.CI/CD pipeline (GitHub Actions)
