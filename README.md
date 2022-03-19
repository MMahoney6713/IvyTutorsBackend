# [Ivy Tutors](https://ivy-tutors.herokuapp.com/)

Ivy Tutors Backend application using Node/Postgres. To access details about the Ivy Tutors React Frontend, including user-flow considerations and other features, please see [Ivy Tutors Frontend Repository](https://github.com/MMahoney6713/IvyTutors)

## Built with

- Node / Express
- Postgresql

## API Documentation

Currently, Ivy Tutors Backend has the following API endpoints available:

### Auth
- POST '/auth/token' : accepts username and password to return token 
- POST '/auth/register' : accepts user info to create new user

### Users
- POST '/users' : admin can add new users, including special permissions for admin
- GET '/users/:email' : returns the user detail for given email address

### Lessons
- POST '/lessons' : adds a lesson to scheduled_lessons table for the student/tutor pair.
- GET '/lessons' : returns all scheduled lessons for the currently logged in user.

### Availability
- POST '/availability' : adds a tutor's availability slot to database
- GET '/availability/:tutor?time' : returns all availabilities for given tutor in given week, determined by the time query param.
- GET '/availability/all/:time' : returns list of all tutors available at a given time.
- DELETE '/availability/:tutor/:time : removes a tutor's availability at given time

## Model and Database Design

![alt text](https://i.imgur.com/IhdUvQJ.png)




