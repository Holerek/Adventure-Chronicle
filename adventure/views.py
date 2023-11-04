import json
import os
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.core import serializers
from django.db import IntegrityError
from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.urls import reverse
from django.db.models import Count
from .models import Adventure, Day, Location
from .forms import NewAdventureForm, EditAdventureForm, NewDayForm, EditDayForm, NewLocationForm, EditLocationForm

# from ..chronicle.settings import MEDIA_ROOT
from django.conf import settings

# Create your views here
def index(request):

    # check if there is a message
    try:
        message = request.GET['message']
    except:
        message = None

    adventures = Adventure.objects.filter(author = request.user.id)
    return render(request, 'adventure/index.html', {
        'message': message,
        'adventures': adventures,
        'new_adv_form': NewAdventureForm(),
        'edit_adv_form': EditAdventureForm(),
    })


@login_required
def adventure(request, id, message=None):

    # check if there is a message
    try:
        message = request.GET['message']
    except:
        pass

    # adventure = Adventure.objects.get(pk = id)
    adventure = get_object_or_404(Adventure, pk=id)
    # check if user is author
    if request.user == adventure.author:
        #load all days for requested adventure
        days = adventure.adventure_days.all().order_by("date")
        
        # create list of tuples (day, locations_list)
        days_and_locations = [(day, day.day_locations.all()) for day in days]

        # convert days and locations query sets to json list
        json_days = json.loads(serializers.serialize('json', days))
        for i, day in enumerate(days):
            locations = day.day_locations.all()
            json_locations = json.loads(serializers.serialize('json', locations))
            json_days[i]['locations'] = json_locations


        return render(request, 'adventure/adventure.html',{
            'id': id,
            'days': days_and_locations,
            'adventure': adventure.title,
            'new_day': NewDayForm(),
            'edit_day': EditDayForm(),
            'new_location': NewLocationForm(),
            'edit_location': EditLocationForm(),
            'message': message,
            'markers_data': json_days,
            'adv': adventure,
        })

    return render(request, 'adventure/layout.html', {
        'message': "Permission Denied!",
    })


@login_required
def create_delete_adventure(request):
     #post request create new adventure in db
    if request.method == "POST":
        form = NewAdventureForm(request.POST)

        #if data is valid then create and save new object
        if form.is_valid():
            data = form.cleaned_data
            new_adv = Adventure(title=data['title'], author = request.user)
            new_adv.save()


    if request.method == "DELETE":
        user = request.user
        data = json.loads(request.body)

        adv_id = data['adv_id']
        adventure = Adventure.objects.get(pk=adv_id)

        # create list of locations image file names for deleting them
        locations = Location.objects.filter(adventure=adventure)
        locations_images = [location.photo for location in locations]

        # check if user is author of adventure
        if user == adventure.author:
            adventure.delete()

            #delete all images of locations for that adventure
            delete_images(locations_images)

            return JsonResponse({
                'message': f'Adventure (id={adv_id}) has been deleted',
            })

    return redirect(reverse('index'))


@login_required
@require_http_methods(['POST'])
def edit_adventure(request):

    form = EditAdventureForm(request.POST)

    if form.is_valid():
        data = form.cleaned_data
        adventure = Adventure.objects.get(pk=data['edit_adventure_id'])

        #validate if user is an author of adventure
        if request.user == adventure.author:
            adventure.title = data['edit_adventure_title']
            adventure.save()

            return JsonResponse({
                'message': 'Adventure has been modified'
            })

    return HttpResponse('400 Invalid data')


@login_required
def day(request):
    if request.method == 'POST':
        form = NewDayForm(request.POST)
        adv_id = request.POST['adv_id']
        reload_path = reverse('adventure', args=[adv_id])

        if form.is_valid():
            data = form.cleaned_data

            # check if user is author of adventure
            if request.user == Adventure.objects.get(pk=adv_id).author:
                new_day = Day(adventure=Adventure.objects.get(pk=adv_id), description=data['description'], date=data['date'])
                new_day.save()

            # message for not authenticated user
            else:
                return redirect(reload_path + '?message=Think again!!!')

            # reload page after successful update
            return redirect(reload_path)

        # invalid data message
        else:
            return redirect(reload_path + '?message=Invalid date!')

    # go back to main page after GET request
    return HttpResponseRedirect(reverse('index'))


@login_required
def edit_day(request):
    if request.method == "POST":
        form = EditDayForm(request.POST)
        adv_id = request.POST['adv_id']
        day_id = request.POST['day_id']

        reload_path = reverse('adventure', args=[adv_id])

        if form.is_valid():
            data = form.cleaned_data
            day = Day.objects.get(pk = int(day_id))

            # validate if user is author of adventure and edited day
            if request.user == day.adventure.author:
                day.description = data['edit_day_description']
                day.date = data['edit_day_date']
                day.save()
            # message for not authenticated user
            else:
                return redirect(reload_path + '?message=Think again!!!')

            # reload page after successful update
            return redirect(reload_path)

        # invalid data message
        else:
            return redirect(reload_path + '?message=Invalid date!')

    # go back to main page after GET request
    return redirect(reverse('index'))


@login_required
def delete_day(request):

    if request.method == "POST":
        data = json.loads(request.body)
        day = Day.objects.get(pk=data['day_id'])

        # create list of locations id for deleting markers on map
        locations = Location.objects.filter(day=day)
        locations_ids = [location.pk for location in locations]

        # create list of locations image file names for deleting them
        locations_images = [location.photo for location in locations]


        if request.user == day.adventure.author:
            day.delete()

            #delete all images of locations for that day
            delete_images(locations_images)

            return JsonResponse({'message': 'Deletion completed',
                                 'locations': locations_ids,})

    # go back to main page after GET request
    return redirect(reverse('index'))


@login_required
def new_location(request):

    if request.method == 'POST':
        form = (NewLocationForm(request.POST, request.FILES))

        if form.is_valid():
            data = form.cleaned_data

        day = Day.objects.get(pk=data['new_location_day'])

        # validate if user is and author of day
        if request.user == day.adventure.author:
            new_location = Location(
                day = day,
                adventure = day.adventure,
                name = data['new_location_name'],
                description = data['new_location_description'],
                lat = data['new_location_lat'],
                lng = data['new_location_lng'],
                photo = data['new_location_img']
            )
            new_location.save()

        return JsonResponse({
            'message': 'Location added.',
            'new_location_id': f'{new_location.id}'

        })

    return redirect(reverse('index'))


@login_required
def edit_location(request):

    if request.method == 'POST':
        form = (EditLocationForm(request.POST, request.FILES))

        if form.is_valid():
            data = form.cleaned_data
            location = Location.objects.get(pk=data['edit_location_id'])

            # validate if user is and author of day
            if request.user == location.adventure.author:

                location.name = data['edit_location_name']
                location.description = data['edit_location_description']

                # prevent deleting existing img if no image was send
                if data['edit_location_img']:
                    delete_images([location.photo])
                    location.photo = data['edit_location_img']

                location.save()

            return JsonResponse({
                'message': 'Location has been modified'
            })

    return redirect(reverse('index'))


@login_required
def delete_location(request):

    if request.method == 'POST':

        # load location data
        data = json.loads(request.body)

        location = Location.objects.get(pk=data['location_id'])

        file_name = location.photo
        delete_images([file_name])

        # validate if user is an author of location
        if location.adventure.author == request.user:
            location.delete()

            return JsonResponse({
                'message': 'location has been removed'
            })

    return redirect(reverse('index'))



def login_view(request):
    if request.method == 'POST':

        # authenticate user
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)

        # check if user was authenticated
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse('index'))
        else:
            return render(request, 'adventure/login.html', {
                'message': 'Invalid username and/or password.'
            })
    else:
        return render(request, 'adventure/login.html')


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse('index'))


def register(request):
    if request.method == 'POST':
        username = request.POST['username']

        # password check
        password = request.POST['password']
        confirmation = request.POST['confirmation']
        if password != confirmation:
            return render(request, 'adventure/register.html', {
                "message": "Passwords doesn't match."
            })

        # create a new user
        try:
            user = User.objects.create_user(username=username, password=password)
            user.save()
        except IntegrityError:
            return render(request, 'adventure/register.html', {
                "message": "Username already taken."
            })

        login(request, user)
        return HttpResponseRedirect(reverse('index'))
    else:
        return render(request, "adventure/register.html")


def delete_images(files_names):

    for file in files_names:
        # generate location of image file
        image_path = f'{settings.MEDIA_ROOT}/{file}'
        print(f'deleting {file}')
        # if there is an image then delete it
        try:
            os.remove(image_path)
        except:
            pass