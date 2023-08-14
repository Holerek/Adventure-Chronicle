from django.contrib import admin
from .models import Adventure, Day, Location

# Register your models here.
admin.site.register(Adventure)
admin.site.register(Day)
admin.site.register(Location)