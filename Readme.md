# YouTube Backend API

## Overview

A scalable backend application inspired by YouTube, built using Node.js, Express.js, MongoDB, and Mongoose. The project provides secure user authentication, video management, subscriptions, playlists, comments, likes, and other core functionalities required for a video-sharing platform.

The backend follows RESTful API principles and implements JWT-based authentication, middleware-based architecture, and proper error handling practices.

## Features

### Authentication & Authorization

* User Registration
* User Login & Logout
* JWT Access Token Authentication
* Refresh Token Mechanism
* Password Hashing using bcrypt

### User Management

* User Profile Management
* Update Account Information
* Change Password
* User Channel Information

### Video Management

* Upload Videos
* Update Video Details
* Delete Videos
* Publish/Unpublish Videos
* Fetch Video Details

### Social Features

* Like Videos
* Dislike Videos
* Comment on Videos
* Reply to Comments
* Subscribe to Channels
* Unsubscribe from Channels

### Playlist Management

* Create Playlist
* Update Playlist
* Delete Playlist
* Add Videos to Playlist
* Remove Videos from Playlist

### Dashboard Features

* Channel Statistics
* User Activity Tracking
* Aggregated Data Queries

## Technology Stack

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Authentication & Security

* JWT (JSON Web Tokens)
* bcryptjs

### File Upload & Storage

* Multer
* Cloudinary

### Development Tools

* Git
* GitHub
* Postman
* Nodemon

## Project Structure

```text
src/
├── controllers/
├── models/
├── routes/
├── middlewares/
├── utils/
├── db/
├── app.js
└── index.js
```

## Key Concepts Implemented

* RESTful API Design
* Authentication & Authorization
* MongoDB Aggregation Pipelines
* Middleware Architecture
* File Upload Handling
* Error Handling
* Token-Based Security
* Database Relationships
* MVC Architecture

## API Testing

All APIs were tested using Postman to ensure reliability and correctness.

## Future Enhancements

* Video Recommendation System
* Real-Time Notifications
* Watch History Analytics
* Video Processing Pipeline
* AI-Powered Content Insights

## Author

Aneesh Sarabu

