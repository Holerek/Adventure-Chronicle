from django.test import TestCase
from .models import Adventure, Day, Location
from django.contrib.auth.models import User




class AdventureTestCase(TestCase):
    
    def setUp(self):

        #create users
        user1 = User.objects.create(username='user1', password='user1')
        user2 = User.objects.create(username='user2', password='user2')

        #create adventures
        a1 = Adventure.objects.create(title='a1', author=user1)
        a2 = Adventure.objects.create(title='a2', author=user2)
        a3 = Adventure.objects.create(title='a3', author=user2)

        #create days
        d1 = Day.objects.create(adventure=a1, description='day 1', date='2023-09-09')
        d2 = Day.objects.create(adventure=a2, description='day 2', date='2023-09-09')
        d3 = Day.objects.create(adventure=a2, description='day 3', date='2023-09-12')

        #create location
        l1 = Location.objects.create(
            day=d1,
            adventure=a1,
            name='location 1 name',
            description='location 1 description',
            lat=50.1,
            lng=16.1
        )

        l2 = Location.objects.create(
            day=d1,
            adventure=a2,
            name='location 2 name',
            description='location 2 description',
            lat=50.0,
            lng=16.0
        )

        l3 = Location.objects.create(
            day=d1, 
            adventure=a2, 
            name='location 3 name',
            description='location 3 description', 
            lat=50.2, 
            lng=16.2
            )

    def test_adventure_count(self):
        """Check if adventure count = 2"""
        user = User.objects.get(username='user2')
        self.assertEqual(user.adventure_set.count(), 2)


    def test_day_count(self):
        """Check if day count = 2"""
        a = Adventure.objects.get(title='a2').adventure_days
        self.assertEqual(a.count(), 2)


    def test_location_count(self):
        """Check if location count = 2"""
        a = Adventure.objects.get(title='a2').adventure_locations
        self.assertEqual(a.count(), 2)


    def test_adventure_duration(self):
        """Check if duration of adventure = 4"""
        a = Adventure.objects.get(title='a2')
        self.assertEqual(a.adventure_duration(), 4)


    def test_is_valid_location(self):
        l1 = Location.objects.get(name='location 1 name')
        l2 = Location.objects.get(name='location 2 name')
        self.assertTrue(l1.is_valid_location())
        self.assertFalse(l2.is_valid_location())
    

    def test_adventure_default(self):
        """Check default valuer for is_public field in Adventure model"""
        a = Adventure.objects.get(title='a1')
        self.assertTrue(a.is_public == False)