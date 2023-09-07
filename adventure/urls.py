from django.urls import path
from . import views


urlpatterns = [
    path('', views.index, name='index'),
    path('login', views.login_view, name='login'),
    path('logout', views.logout_view, name='logout'),
    path('register', views.register, name='register'),
    path('adventure/<int:id>', views.adventure, name='adventure'),

    #API routes
    path('day', views.day, name='day'),
    path('edit-day', views.edit_day, name='edit day'),
    path('delete-day', views.delete_day, name='delete day'),
    path('create-adventure', views.create_adventure, name='create adventure'),
    path('edit-adventure', views.edit_adventure, name='edit adventure'),
    path('location', views.new_location, name='location'),
    path('edit-location', views.edit_location, name='edit location'),
    path('delete-location', views.delete_location, name='delete location'),
]
