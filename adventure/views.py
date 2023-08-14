import json
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.urls import reverse
from django import forms
from .models import Adventure, Day, Location

# Create your views here.
class NewAdventureForm(forms.Form):
    title = forms.CharField(max_length=128)

class NewDayForm(forms.Form):
    date = forms.DateField()
    description = forms.CharField(max_length=5000, widget=forms.Textarea(attrs={ 'autofocus': 'true', }) , strip=True,)

class EditDayForm(forms.Form):
    edit_day_date = forms.DateField()
    edit_day_description = forms.CharField(max_length=5000, widget=forms.Textarea(attrs={ 'autofocus': 'true', }) , strip=True,)



def index(request):
    
    #post request create new adventure in db
    if request.method == "POST":
        form = NewAdventureForm(request.POST)
        
        #if data is valid then create and save new object
        if form.is_valid():
            data = form.cleaned_data
            new_adv = Adventure(title=data['title'])
            new_adv.save()
        
        return HttpResponseRedirect(reverse('index'))
    
    adventures = Adventure.objects.all()
    return render(request, 'adventure/index.html', {
        'adventures': adventures,
        'form': NewAdventureForm()
    })


def adventure(request, id):
    
    #load all days for reqeuested adventure
    days = Day.objects.filter(adventure = id).order_by("date")
    d = Day.objects.get(pk=1)
    return render(request, 'adventure/map.html',{
        'id': id,
        'days': days,
        'new_day': NewDayForm(),
        'edit_day': EditDayForm(),
    })



def map(request):
    return render(request, 'adventure/map.html')


def day(request):
    if request.method == 'POST':
        form = NewDayForm(request.POST)
        id = request.POST['id']
        if form.is_valid():
            data = form.cleaned_data
            new_day = Day(adventure=Adventure.objects.get(pk=id), description=data['description'], date=data['date'])
            new_day.save()

        return HttpResponseRedirect(f'/adventure/{id}')

    return HttpResponseRedirect(reverse('index'))


def edit_day(request):
    if request.method == "POST":
        form = EditDayForm(request.POST)
        adv_id = request.POST['adv_id']
        day_id = request.POST['day_id']
        
        if form.is_valid():
            data = form.cleaned_data
            day = Day.objects.get(pk = int(day_id))
            day.description = data['edit_day_description']
            day.date = data['edit_day_date']
            day.save()

        return HttpResponseRedirect(f'/adventure/{adv_id}')

    return HttpResponseRedirect(reverse('index'))


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
