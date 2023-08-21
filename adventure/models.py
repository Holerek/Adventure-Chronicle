from django.contrib.auth.models import User
from django.db import models

# Create your models here.


class Adventure(models.Model):
    title = models.CharField(max_length=128)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    is_public = models.BooleanField(default=False)

class Day(models.Model):
    adventure = models.ForeignKey(Adventure, on_delete=models.CASCADE)
    description = models.CharField(max_length=5000)
    date = models.DateField()
    # locations = models.ManyToManyField(Location, related_name="location_of_day")
    # routs = models.ManyToManyField(Rout, related_name="routs_of_day")

    

class Location(models.Model):
    day = models.ForeignKey(Day, on_delete=models.CASCADE)
    adventure = models.ForeignKey(Adventure, on_delete=models.CASCADE)
    name = models.CharField(max_length=128)
    description = models.CharField(max_length=5000)
    lat = models.FloatField()
    lng = models.FloatField()
