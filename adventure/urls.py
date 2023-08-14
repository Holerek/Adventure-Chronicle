from django.urls import path
from . import views


urlpatterns = [
    path('', views.index, name='index'),
    path('login', views.login_view, name='login'),
    path('logout', views.logout_view, name='logout'),
    path('regiser', views.register, name='register'),
    path('adventure/<int:id>', views.adventure, name='adventure'),
    path('map', views.map, name='map'),

    #API routes
    path('day', views.day, name='day'),
    path('edit-day', views.edit_day, name='edit day'),
    path('delete-adventure', views.delete_adventure, name='delete adventure'),
]