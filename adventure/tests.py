from django.test import TestCase, Client, LiveServerTestCase
from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from .models import Adventure, Day, Location
from django.contrib.auth.models import User
from django.db.models import Max
from selenium import webdriver
from selenium.webdriver.common.by import By
from time import sleep



class AdventureTestCase(TestCase):
    
    def setUp(self):

        #create users
        user1 = User.objects.create(username='user1')
        user2 = User.objects.create_user(username='user2', password='user2')

        #create adventures
        a1 = Adventure.objects.create(title='a1', author=user1)
        a2 = Adventure.objects.create(title='a2', author=user2)
        a3 = Adventure.objects.create(title='a3', author=user2)

        #create days
        d1 = Day.objects.create(adventure=a1, description='day 1', date='2023-09-09')
        d2 = Day.objects.create(adventure=a2, description='day 2', date='2023-09-09')
        d3 = Day.objects.create(adventure=a2, description='day 3', date='2023-09-12')

        #create location
        l1 = Location.objects.create(day=d1, adventure=a1, name='location 1 name', description='location 1 description', lat=50.1, lng=16.1)
        l2 = Location.objects.create(day=d1, adventure=a3, name='location 2 name', description='location 2 description', lat=50.0, lng=16.0)
        l3 = Location.objects.create(day=d2,  adventure=a2,  name='location 3 name', description='location 3 description',  lat=50.2,  lng=16.2 )
        l4 = Location.objects.create(day=d3,  adventure=a2,  name='location 4 name', description='location 4 description',  lat=50.4,  lng=16.4 )
        l5 = Location.objects.create(day=d3,  adventure=a2,  name='location 5 name', description='location 5 description',  lat=50.4,  lng=16.4 )


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
        self.assertEqual(a.count(), 3)


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

    
    def test_index_view(self):
        
        # set up client
        c = Client()

        # Check if none logged in user receive empty adventure queryset
        response = c.get('/')
        self.assertEqual(response.status_code, 200) 
        self.assertEqual(response.context['adventures'].count(), 0)

        # login
        logged_id = c.login(username='user2', password='user2')
        self.assertTrue(logged_id, 'User failed to log in')

        # Check if logged in user receive none empty adventure queryset
        response = c.get('')
        self.assertEqual(response.status_code, 200) 
        self.assertEqual(response.context['adventures'].count(), 2)


    def test_logout_adventure_view(self):
        
        # set up client
        c = Client()

        # not logged in user should be redirect to log in page regardless of adventure id
        response = c.get(f'/adventure/2323')
        self.assertEqual(response.status_code, 302)
        self.assertTrue(response.url.startswith('/login')) 


    def test_login_adventure_view(self):
        
        c = Client()
        a = Adventure.objects.get(title='a2')

        #login
        logged_id = c.login(username='user2', password='user2')
        self.assertTrue(logged_id, 'User failed to log in')

        # Check if logged in user receive list of tuples [(Day QuerySet, Location QuerySet),..]
        response = c.get(f'/adventure/{a.id}')
        self.assertEqual(response.status_code, 200) 

        # number of days is the same as number of items in the list
        self.assertEqual(len(response.context['days']), 2)
        
        # extract all location and add all. 
        self.assertEqual(sum([len(l) for d, l in response.context['days']]), 3)

        #try to open nonexisting adventure
        max_id = Adventure.objects.aggregate(max=Max("pk"))['max']
        response = c.get(f'/adventures/{max_id + 1}')
        self.assertEqual(response.status_code, 404)


    def test_login_view(self):

        c = Client()

        #invalid login
        response = c.post('/login', {'username': 'usersssss2', 'password':'user2'})
        self.assertTrue(response.status_code == 200 and len(response.context['message']) > 0)

        #valid login
        response = c.post('/login', {'username': 'user2', 'password':'user2'})
        self.assertTrue(response.status_code == 302 and response.url == '/')

    
    def test_create_adventure(self):
        """Check that logged in user can create new Adventure"""
        # create client and log user in 
        c = Client()
        c.login(username='user2', password='user2')
        
        # send post request with Adventure data
        title = 'create new location test'
        response = c.post('/create-adventure', {
            'title': title,
        })

        #redirect to index page
        self.assertEqual(response.status_code, 302)
        
        new_adv = Adventure.objects.get(title=title)
        self.assertTrue(isinstance(new_adv, Adventure))



driver = webdriver.Chrome()

class WebpageTests(StaticLiveServerTestCase):

    def setUp(self):
        #create user
        user3 = User.objects.create_user(username='user3', password='user3')
    

    def test_title(self):
        driver.get(self.live_server_url)
        self.assertEqual(driver.title, 'Adventure Chronicle')


    def test_create_adventure(self):
        # load login page 
        driver.get(self.live_server_url + '/login')
        heading = driver.find_element(by=By.TAG_NAME, value='h2').text
        self.assertEqual(heading, 'Login')
        
        # select login form fields and button
        username_field = driver.find_element(by=By.NAME, value='username')
        password_field = driver.find_element(by=By.NAME, value='password')
        submit_button = driver.find_element(by=By.CSS_SELECTOR, value='input[type="submit"]')

        # insert data and submit the form 
        username_field.send_keys('user3')
        password_field.send_keys('user3')
        submit_button.click()
        
        # check that successful logged in and redirect to main page
        logged_in_username = driver.find_element(by=By.ID, value='logged-in-username').text
        heading = driver.find_element(by=By.CLASS_NAME, value='title').text
        self.assertEqual(logged_in_username, 'User3:')
        self.assertEqual(heading, 'Adventure Chronicles')

        # create new adventure
        driver.find_element(by=By.ID, value='newAdventureButton').click()
        driver.find_element(by=By.ID, value='id_title').send_keys('Selenium Adv')
        driver.find_element(by=By.CSS_SELECTOR, value='input[type="submit"]').click()

        # Check that adventure was created
        div = driver.find_element(by=By.CLASS_NAME, value='adventure-item')
        adv_title = div.find_element(by=By.TAG_NAME, value='span').text
        self.assertEqual(adv_title, 'Selenium Adv')



