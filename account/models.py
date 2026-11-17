from django.db import models
from django.contrib.auth.models import BaseUserManager,AbstractBaseUser,PermissionsMixin

class UserManager(BaseUserManager):
    def create_user(self,email,password=None,**extrafields):
        if not email:
            raise ValueError("User must have a valid email")
        extrafields.setdefault('is_active',False)
        extrafields.setdefault('is_staff',False)
        extrafields.setdefault('is_superuser',False)
        extrafields.setdefault('role', 'donor')

        user = self.model(email=self.normalize_email(email),**extrafields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self,email,password=None,**extrafields):
        extrafields.setdefault('is_active',True)
        extrafields.setdefault('is_staff',True)
        extrafields.setdefault('is_superuser',True)
        extrafields.setdefault('role', 'admin')

        if extrafields.get('is_staff') is not True:
            raise ValueError("Superuser must be is_staff as True")
        if extrafields.get('is_active') is not True:
            raise ValueError("Superuser must be is_active as True")

        user = self.create_user(email,password,**extrafields)
        return user

class User(AbstractBaseUser,PermissionsMixin):
    ROLE_CHOICES = (
        ('doctor', 'Doctor'),
        ('donor', 'Donor'),
        ('patient', 'Patient'),
        ('hospital','Hospital'),
        ('admin', 'Admin'),
    )
    email = models.EmailField(max_length=50,unique=True)
    role = models.CharField(max_length=15, choices=ROLE_CHOICES)
    is_active = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_groups',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

    USERNAME_FIELD = 'email'
    objects = UserManager()
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email

    def has_perm(self,perm,object=None):
        return self.is_superuser

    def has_module_perms(self,app_label):
        return self.is_superuser

BLOOD_GROUPS = (('A+', 'A+'), ('A-', 'A-'), ('B+', 'B+'), ('AB+', 'AB+'), ('AB-', 'AB-'), ('O+', 'O+'), ('O-', 'O-'),('B-', 'B-')) 

class Hospital(models.Model):
    user = models.OneToOneField(User,on_delete=models.CASCADE,related_name='hospital_profile',null=True,blank=True)
    name = models.CharField(max_length=150)
    license_number = models.CharField(max_length=50, unique=True)
    address = models.TextField()
    city = models.CharField(max_length=50)
    contact_number = models.CharField(max_length=15)
    is_verified = models.BooleanField(default=False) 

    def __str__(self):
        return f"{self.name} ({self.city})"

class Doctor(models.Model):
    user = models.OneToOneField(User,on_delete=models.CASCADE,primary_key=True,related_name='doctor_profile')
    name = models.CharField(max_length=100)
    specialization = models.CharField(max_length=100)
    license_number = models.CharField(max_length=50, unique=True)
    hospital = models.ForeignKey(Hospital, on_delete=models.SET_NULL, null=True, related_name='doctors')
    current_blood_group = models.CharField(max_length=3, choices=BLOOD_GROUPS, null=True, blank=True)

    def __str__(self):
        return self.name

class Donor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, related_name='donor_profile')
    name = models.CharField(max_length=100)
    city = models.CharField(max_length=50, null=True, blank=True)
    blood_group = models.CharField(max_length=3, choices=BLOOD_GROUPS)
    last_donation_date = models.DateField(null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    is_eligible = models.BooleanField(default=True)
    admit_hospital = models.ForeignKey(Hospital,on_delete=models.SET_NULL,null=True,related_name='donors') 
    disease_history = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Patient(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, related_name='patient_profile')
    name = models.CharField(max_length=100)
    city = models.CharField(max_length=50, null=True, blank=True)
    blood_group_required = models.CharField(max_length=3, choices=BLOOD_GROUPS)
    disease_history = models.TextField(blank=True, null=True)
    current_hospital = models.ForeignKey(Hospital, on_delete=models.SET_NULL, null=True, related_name='patients')

    def __str__(self):
        return self.name


class BloodStock(models.Model):
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='blood_stock')
    blood_group = models.CharField(max_length=3, choices=BLOOD_GROUPS)
    quantity_in_units = models.PositiveIntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('hospital', 'blood_group')
        verbose_name_plural = "Blood Stocks"

    def __str__(self):
        return f"{self.hospital.name} - {self.blood_group}: {self.quantity_in_units} Units"


class BloodRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved by Doctor'),
        ('scheduled', 'Date Scheduled by Hospital'),
        ('rejected', 'Rejected'),
        ('completed', 'Blood Donated Successfully'),
    )

    DONATION_TYPE_CHOICES = (
        ('hospital', 'At Hospital'),
        ('home', 'Home Collection'),
    )
    
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='blood_requests')
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE,related_name='blood_request')
    blood_group_required = models.CharField(max_length=3, choices=BLOOD_GROUPS)
    units_required = models.PositiveIntegerField(default=1)
    accepted_by_donor = models.ForeignKey(Donor, on_delete=models.SET_NULL, null=True, blank=True, related_name='accepted_donations')
    donation_location = models.CharField(max_length=15, choices=DONATION_TYPE_CHOICES, default='hospital')
    donor_home_address = models.TextField(null=True, blank=True) 
    is_home_donation_allowed = models.BooleanField(default=False) 
    donor_appointment_date = models.DateTimeField(null=True, blank=True) 
    patient_delivery_date = models.DateTimeField(null=True, blank=True)  
    reason = models.TextField(blank=True, null=True)
    assigned_doctor = models.ForeignKey(Doctor,on_delete=models.SET_NULL,null=True,blank=True,related_name='assigned_blood_requests')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self,*args,**kwargs):
        if self.donation_location == 'home' and not self.donor_home_address and self.accepted_by_donor:
            self.donor_home_address = self.accepted_by_donor.address
        super().save(*args,**kwargs)

    def __str__(self):
        return f"Request by {self.patient.name} for {self.blood_group_required} ({self.status})"

class BloodDonation(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('scheduled', 'Date Scheduled'),
        ('completed', 'Donated'),
        ('cancelled', 'Cancelled'),
    )

    DONATION_TYPE_CHOICES = (
        ('hospital', 'At Hospital'),
        ('home', 'Home Collection'),
    )
    donor = models.ForeignKey(Donor, on_delete=models.CASCADE, related_name='donations')
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='incoming_donations')
    blood_group = models.CharField(max_length=3, choices=BLOOD_GROUPS)
    units = models.PositiveIntegerField(default=1)
    donation_location = models.CharField(max_length=15, choices=DONATION_TYPE_CHOICES, default='hospital')
    donor_home_address = models.TextField(null=True, blank=True)
    is_home_donation_allowed = models.BooleanField(default=False)
    scheduled_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.donation_location == 'home' and not self.donor_home_address and self.donor:
            self.donor_home_address = self.donor.address
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Donation by {self.donor.name} at {self.hospital.name} ({self.status})"


