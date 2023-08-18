import json
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.shortcuts import render, redirect
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.urls import reverse
from django import forms
from .models import Adventure, Day, Location

# Create your views here
class NewAdventureForm(forms.Form):
    title = forms.CharField(max_length=128)

class NewDayForm(forms.Form):
    date = forms.DateField(widget=forms.DateInput(attrs={'placeholder': 'YYYY-MM-DD', 'maxlength': '10'},))
    description = forms.CharField(max_length=5000, widget=forms.Textarea(attrs={ 'autofocus': 'true', 'placeholder': 'Describe your day :)'}) , strip=True,)

class EditDayForm(forms.Form):
    edit_day_date = forms.DateField(widget=forms.DateInput(attrs={'placeholder': 'YYYY-MM-DD', 'maxlength': '10'},))
    edit_day_description = forms.CharField(max_length=5000, widget=forms.Textarea(attrs={ 'autofocus': 'true', 'placeholder': 'YYYY-MM-DD'}) , strip=True,)

class NewLocationForm(forms.Form):
    new_location_name = forms.CharField(max_length=5000, strip=True, widget=forms.TextInput(attrs={'placeholder': 'Title', 'autofocus': 'true'}))
    new_location_description = forms.CharField(max_length=5000, widget=forms.Textarea(attrs={'placeholder': 'Description',}) , strip=True,)
    new_location_lat = forms.FloatField(widget=forms.NumberInput(attrs={'type': 'hidden',}))
    new_location_lng = forms.FloatField(widget=forms.NumberInput(attrs={'type': 'hidden',}))
    # img = forms.ImageField()


def index(request):
    
    adventures = Adventure.objects.filter(author = request.user.id)
    return render(request, 'adventure/index.html', {
        'adventures': adventures,
        'form': NewAdventureForm(),
    })


@login_required
def adventure(request, id, message=None):
    
    # check if there is a message
    try:
        message = request.GET['message']
    except:
        pass
    

    # check if user is author
    if request.user == Adventure.objects.get(pk = id).author: 
        #load all days for requested adventure
        days = Day.objects.filter(adventure = id).order_by("date")
        days_and_locations = []
        # add locations to days
        for i in range(len(days)):
            locations = Location.objects.filter(day=days[i])
            days_and_locations.append([days[i], locations])

        return render(request, 'adventure/adventure.html',{
            'id': id,
            'days': days_and_locations,
            'new_day': NewDayForm(),
            'edit_day': EditDayForm(),
            'new_location': NewLocationForm(),
            'message': message,
        })
    
    return render(request, 'adventure/layout.html', {
        'message': "Permission Denied!",
    })


@login_required
def create_adventure(request):
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

        # check if user is author of adventure
        if user == adventure.author:
            adventure.delete()
            return JsonResponse({
                'message': f'Adventure (id={adv_id}) has been deleted',
            })
        
    return redirect(reverse('index'))


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
def location(request):
    
    if request.method == 'POST':
        data = json.loads(request.body)
        day = Day.objects.get(pk=data['day_id'])
        print(data)
        # validate if user is and author of day
        if request.user == day.adventure.author:
            new_location = Location(
                day = day,
                adventure = day.adventure,
                name = data['name'],
                description = data['description'],
                lat = data['lat'],
                lon = data['lng']
            )
            new_location.save()
            print(Location.objects.all())
            return JsonResponse({
                'message': 'Location added'
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
