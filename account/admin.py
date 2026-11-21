from django.contrib import admin
from account.models import User,Doctor,Patient,Donor,BloodRequest,BloodStock,Hospital,BloodDonation,AdminProfile
from django.contrib.auth.admin import UserAdmin

class UserModelAdmin(UserAdmin):
    model = User
    list_display = ['email','role','is_active','is_staff','is_superuser','created_at','updated_at']
    list_filter = ['role','is_superuser','is_staff','is_active']
    readonly_fields = ['created_at', 'updated_at', 'last_login']
    fieldsets = [
        ('User Credentials',{'fields':['email','password']}),
        ('Permissions',{'fields':['is_active','is_staff','is_superuser','role','groups','user_permissions']}),
        ('Important Dates', {'fields': ['last_login', 'created_at', 'updated_at']})
    ]

    add_fieldsets = [
        (
            None,
            {
                'classes':['wide'],
                'fields':['email', 'role', 'password1', 'password2']
            }
        )
    ]

    search_fields = ['email']
    ordering = ['email'] 
    filter_horizontal = ['groups', 'user_permissions']
admin.site.register(User,UserModelAdmin)


class AdminProfileAdmin(admin.ModelAdmin):
    list_display = ['name','get_email','phone','created_at']
    list_filter = ['name','user__email']
    list_select_related = ['user']

    def get_email(self,obj):
        return obj.user.email
    get_email.short_description = 'Email'
admin.site.register(AdminProfile,AdminProfileAdmin)



class HospitalAdmin(admin.ModelAdmin):
    list_display = ['name', 'license_number','city', 'contact_number', 'is_verified']
    list_filter = ['city', 'is_verified']
    search_fields = ['name', 'license_number', 'city']
    list_editable = ['is_verified','contact_number']

    def save_model(self,request,obj,form,change):
        super().save_model(request,obj,form,change)
        if obj.user:
            obj.user.is_active = obj.is_verified
            obj.user.save()
admin.site.register(Hospital,HospitalAdmin)


class DoctorAdmin(admin.ModelAdmin):
    list_display = ['name', 'get_email', 'specialization', 'license_number', 'hospital','current_blood_group']
    list_filter = ['specialization', 'hospital']
    search_fields = ['name', 'license_number', 'user__email']
    list_editable = ['current_blood_group']
    list_select_related = ['user', 'hospital']

    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'
admin.site.register(Doctor,DoctorAdmin)


class DonorAdmin(admin.ModelAdmin):
    list_display = ['name', 'get_email', 'blood_group', 'last_donation_date', 'is_eligible','admit_hospital','disease_history']
    list_filter = ['blood_group', 'is_eligible']
    search_fields = ['name', 'user__email']
    list_editable = ['is_eligible']
    list_select_related = ['user', 'admit_hospital']

    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'
admin.site.register(Donor,DonorAdmin)


class PatientAdmin(admin.ModelAdmin):
    list_display = ['name', 'get_email', 'blood_group_required','disease_history', 'current_hospital']
    list_filter = ['blood_group_required', 'current_hospital']
    search_fields = ['name', 'user__email']
    list_select_related = ['user', 'current_hospital']

    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'
admin.site.register(Patient,PatientAdmin)


class BLoodStockAdmin(admin.ModelAdmin):
    list_display = ['hospital', 'blood_group', 'quantity_in_units', 'last_updated']
    list_filter = ['blood_group', 'hospital']
    search_fields = ['hospital__name']
    list_editable = ['quantity_in_units']
    list_select_related = ['hospital']
admin.site.register(BloodStock,BLoodStockAdmin)


class BloodRequestAdmin(admin.ModelAdmin):
    list_display = ['patient', 'hospital', 'blood_group_required','is_home_donation_allowed','units_required','accepted_by_donor','donation_location','donor_appointment_date','status']
    list_filter = ['status', 'blood_group_required','donation_location', 'is_home_donation_allowed', 'hospital']
    search_fields = ['patient__name', 'hospital__name', 'accepted_by_donor__name', 'assigned_doctor__name']
    list_editable = ['status', 'is_home_donation_allowed']
    list_select_related = ['patient', 'hospital', 'assigned_doctor', 'accepted_by_donor']
admin.site.register(BloodRequest,BloodRequestAdmin)


class BloodDonationAdmin(admin.ModelAdmin):
    list_display = ['donor','hospital','blood_group','units', 'donation_location', 
    'is_home_donation_allowed','scheduled_date','status','created_at']
    list_filter = ['status', 'blood_group', 'donation_location', 'is_home_donation_allowed', 'scheduled_date']
    search_fields = ['donor__name','hospital__name']
    list_editable = ['status', 'is_home_donation_allowed']
    list_select_related = ['donor', 'hospital']
admin.site.register(BloodDonation,BloodDonationAdmin)