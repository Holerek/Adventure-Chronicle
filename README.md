# Adventure Chronicle
#### Video Demo: https://youtu.be/5AoR3o60rkc
### Presentation

![Adding new location](presentation1.png)

![Overview](presentation2.png)

![editing location](presentation3.png)

## Description:
Web application, written in django framework for keeping track of user adventures/journeys. After registering and logging in user can create adventures. When adventure is made user can open adventure detail pages where user can create days of his adventure and each day can contains many locations. Locations are displayed on location list after expanding day details and on the map. Each location can have one photo of itself. Map functionality if provided by JavaScript Leaflet library. 

## Requirements
* [django 4.2](https://www.djangoproject.com/) - core framework.
* [pillow](https://pypi.org/project/Pillow/) - uploading images
* [selenium](https://pypi.org/project/selenium/) - web browser tests

## How to run
Install all requirements and in main application folder run commands:

        python3 manage.py makemigrations
        python3 manage.py migrate
        python3 manage.py runserver

## Design decisions
For creating that are not so often created (Adventures and Days) app is using forms with action and post method. Locations are created by API and html elements are created with use of JavaScript. Reason of it is that one day can contains dozens of locations so it would be inconvenient for user if page would refresh after creating each location. 
Also all updates and deletions of models objects are performed by fetch to API's

## File Overview

### Python files
```
/adventure
```
* **views.py** - Contains all views and API endpoints. Responsible for deleting image files of deleted Locations.
* **forms.py** - Contains forms for creating and updating models. 
* **urls.py** - urls management.
* **models.py** - contains database models.
* **tests.py** - models, views and browser testing.

### HTML templates:
```
/adventure/templates/adventure
```
### JavaScript and CSS:
```
/adventure/static/adventure
```
* **index.js** - used in the main page, responsible for updating and deleting adventures via fetch and showing/hiding form.
* **adventure.js** - adventure detail page, responsible for updating/deleting Days and creating/updating/deleting Location via fetch. Generates open street map and populate it with markers and popups. Adventure.js also generates new html elements after creating new location and delete elements of deleted Days and Locations. 
* **map.js** - Initialize the map on index/login/register pages (Leaflet)
* **util.js** - File with helper functions used in adventure.js and index.js
* **style.css** - All stylings and Media query for mobile responsiveness.

### Images:
```
/adventures/media/
```
Storage location of uploaded images.

### Icons:
```
/adventures/static/adventure/img
```
Location of icons used in app.