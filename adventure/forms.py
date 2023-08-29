from django import forms


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
    new_location_day = forms.IntegerField(widget=forms.NumberInput(attrs={'type': 'hidden',}))
    new_location_img = forms.ImageField(required=False)

class EditLocationForm(forms.Form):
    edit_location_name = forms.CharField(max_length=5000, strip=True, widget=forms.TextInput(attrs={'placeholder': 'Title', 'autofocus': 'true'}))
    edit_location_description = forms.CharField(max_length=5000, widget=forms.Textarea(attrs={'placeholder': 'Description',}) , strip=True,)
    # edit_location_lat = forms.FloatField(widget=forms.NumberInput(attrs={'type': 'hidden',}))
    # edit_location_lng = forms.FloatField(widget=forms.NumberInput(attrs={'type': 'hidden',}))
    # edit_location_day = forms.IntegerField(widget=forms.NumberInput(attrs={'type': 'hidden',}))
    edit_location_id = forms.IntegerField(widget=forms.NumberInput(attrs={'type': 'hidden',}))
    edit_location_img = forms.ImageField(required=False)