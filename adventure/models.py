from django.contrib.auth.models import User
from django.db import models



class Adventure(models.Model):
    title = models.CharField(max_length=128)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    is_public = models.BooleanField(default=False)

    def __str__(self):
        return f'adv: {self.title}'


class Day(models.Model):
    adventure = models.ForeignKey(Adventure, on_delete=models.CASCADE)
    description = models.CharField(max_length=5000)
    date = models.DateField()

    def __str__(self):
        return f'day: {self.date}'


    
class Location(models.Model):
    day = models.ForeignKey(Day, on_delete=models.CASCADE)
    adventure = models.ForeignKey(Adventure, on_delete=models.CASCADE)
    name = models.CharField(max_length=128)
    description = models.CharField(max_length=5000)
    photo = models.ImageField(null=True, blank=True, upload_to='images/')
    lat = models.FloatField()
    lng = models.FloatField()

    def __str__(self):
        return self.name
