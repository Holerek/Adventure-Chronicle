# Generated by Django 4.2.4 on 2023-08-21 12:28

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('adventure', '0003_remove_location_day_location_day'),
    ]

    operations = [
        migrations.RenameField(
            model_name='location',
            old_name='lon',
            new_name='lng',
        ),
    ]
