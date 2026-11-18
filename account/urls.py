from django.urls import path
from account.views import DoctorRegisterAPIView,ActivateDoctorByHospitalAPIView,CheckAuthAPIView,DonorRegisterAPIView,PatientRegisterAPIView,LoginAPIView,ActivateAccountAPIView,ResetEmailConfirmAPIView,ResetPasswordAPIView,ChangePasswordAPIView,AdminDashboardAPIView,HospitalDashboardAPIView,BloodRequestListCreateAPIView,DonorAccesptRequestAPIView,HospitalSceduleRequestAPIView,DonorDashboardAPIView,PatientDashboardAPIView,DoctorDashboardAPIView
from rest_framework_simplejwt.views import TokenRefreshView

app_name = 'account'


urlpatterns = [
    # authentication
    path('api/register/doctor/',DoctorRegisterAPIView.as_view(),name='doctor_register'),
    path('api/register/donor/',DonorRegisterAPIView.as_view(),name='donor_register'),
    path('api/register/patient/',PatientRegisterAPIView.as_view(),name='patient_register'),
    path('api/activate/<str:uidb64>/<str:token>/',ActivateAccountAPIView.as_view(),name='activation_email'),
    path('api/activate/doctor/<int:doctor_id>/',ActivateDoctorByHospitalAPIView.as_view(),name='doctor_activate'),
    path('api/login/',LoginAPIView.as_view(),name='login'),
    path('api/reset_password/',ResetPasswordAPIView.as_view(),name='reset_password'),
    path('api/reset_confirm/<str:uidb64>/<str:token>/',ResetEmailConfirmAPIView.as_view(),name='reset_confirm'),
    path('api/change_password/',ChangePasswordAPIView.as_view(),name='change_password'),

    # dashboards
    path('api/admin/dashboard/',AdminDashboardAPIView.as_view(),name='admin_dashboard'),
    path('api/hospital/dashboard/',HospitalDashboardAPIView.as_view(),name='hospital_dashboard'),
    path('api/patient/dashboard/',PatientDashboardAPIView.as_view(),name='patient_dashboard'),
    path('api/doctor/dashboard/',DoctorDashboardAPIView.as_view(),name='doctor_dashboard'),
    path('api/donor/dashboard/',DonorDashboardAPIView.as_view(),name='donor_dashboard'),

    # blood request
    path('api/blood_request/',BloodRequestListCreateAPIView.as_view(),name='blood_request'),
    path('api/blood_request/<int:pk>/accept/',DonorAccesptRequestAPIView.as_view(),name='donor_accept_request'),
    path('api/blood_request/<int:pk>/schedule/',HospitalSceduleRequestAPIView.as_view(),name='hospital_schdule_request'),

    #auth token
    path('api/token/refresh/',TokenRefreshView.as_view(), name='token_refresh'),
    path('api/check_auth/',CheckAuthAPIView.as_view(),name='check_auth')
]