from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.utils.http  import urlsafe_base64_decode,urlsafe_base64_encode
from django.utils.encoding import force_bytes,force_str
from django.contrib.auth.tokens import default_token_generator
from account.serializer import (
    DonorSerializer, DoctorSerializer, HospitalSerializer, PatientSerializer,
    BloodStockSerializer, BloodRequestSerializer, BloodDonationSerializer,
    HospitalDetailSerializer, AdminDashboardSerializer,
    LoginSerializer, ResetPasswordSerializer, ResetPasswordConfirmSerializer, ChangePasswordSerializer
)
from account.models import User, Hospital, Doctor, Donor, Patient, BloodRequest, BloodStock, BloodDonation
from account.utils import send_activation_email,send_updation_email
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import get_object_or_404


class DoctorRegisterAPIView(APIView):
    def post(self,request):
        serializer = DoctorSerializer(data = request.data) # request.data converts the frontend bytestream data into dict and DoctorSerializer class converts it into serializer object
        if serializer.is_valid():
            serializer.save() # converts the serializer object into doctor and user model object and saves in db and returns doctor object to doctor_profile
            return Response({
                "message":"Doctor registered successfully, contact your hospital admin to activate your account",
                "data":serializer.data # serializer model object sends only the data dict
            },status=status.HTTP_201_CREATED)

        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)


class DonorRegisterAPIView(APIView):
    def post(self,request):
        serializer = DonorSerializer(data = request.data)
        if serializer.is_valid():
            donor_profile = serializer.save()
            user = donor_profile.user

            try:
                uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
                token = default_token_generator.make_token(user)
                activation_url = f"{settings.SITE_DOMAIN}/activate.html?uidb64={uidb64}&token={token}"
                send_activation_email(user.email,activation_url)
                return Response({
                    "message":"Donor registered successfully, check your email to activate your account",
                    "data":serializer.data
                },status=status.HTTP_201_CREATED)

            except Exception as e:
                print("Email sending failed",str(e))
                return Response({
                    "message":"Donor registered successfully but activation email could not be send",
                    "data":serializer.data
                },status=status.HTTP_201_CREATED)

        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)


class PatientRegisterAPIView(APIView):
    def post(self,request): 
        serializer = PatientSerializer(data = request.data) # request.data convert the frontend byte steams into dict and PatientSerializer convert it into serializer object
        if serializer.is_valid():
            patient_profile = serializer.save() # serializer object is converted into model object and saved in db and stored in patient_profile as an patient object
            user = patient_profile.user # user object inside the patient_profile object is saved in user var

            try:
                uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
                token = default_token_generator.make_token(user)
                activation_url = f"{settings.SITE_DOMAIN}/activate.html?uidb64={uidb64}&token={token}"
                send_activation_email(user.email,activation_url)
                return Response({
                    "message":"Patient registered successfully, check your email to activate your account",
                    "data":serializer.data # serializer model object sends only the data dict 
                },status=status.HTTP_201_CREATED)

            except Exception as e:
                print("Email sending failed",str(e))
                return Response({
                    "message":"Patient registered successfully but activation email could not be send",
                    "data":serializer.data
                },status=status.HTTP_201_CREATED)

        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)


class ActivateDoctorByHospitalAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self,request,doctor_id):
        if request.user.role != 'doctor':
            return Response({"message": "Only Hospital can activate doctors"}, status=status.HTTP_403_FORBIDDEN)

        hospital = request.user.hospital_profile
        doctor = get_object_or_404(Doctor,user_id = doctor_id,hospital = hospital)

        doctor.user.is_active = True
        doctor.save()

        return Response({"message": f"Dr. {doctor.name} has been activated."}, status=status.HTTP_200_OK)

    

class ActivateAccountAPIView(APIView):
    def get(self,request,uidb64,token):
        try:
            uidb = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uidb)

            if user.is_active:
                return Response({
                    "message":"User account is already activated",
                    "redirect_to": "login.html"
                },status=status.HTTP_200_OK)

            if default_token_generator.check_token(user,token):
                user.is_active = True
                user.save()
                return Response({
                    "message":"User account is activated",
                    "redirect_to": "login.html"
                },status=status.HTTP_200_OK)

            else:
                return Response({
                    "message":"Invalid activation link or link is expired",
                    "redirect_to": "login.html"
                },status=status.HTTP_400_BAD_REQUEST)

        except(OverflowError,TypeError,ValueError,User.DoesNotExist):
            return Response({
                "message":"Invalid activation link",
                "redirect_to": "login.html"
            },status=status.HTTP_400_BAD_REQUEST) 



class LoginAPIView(APIView):
    def post(self,request):
    
        serializer = LoginSerializer(data = request.data)
        if serializer.is_valid():
            email = serializer.validated_data.get('email')
            password = serializer.validated_data.get('password')

            existing_user = User.objects.filter(email=email).first()
            if existing_user and existing_user.check_password(password):
                if not existing_user.is_active:
                    if existing_user.role == 'hospital':
                        msg = "Your hospital account is pending Super Admin verification."  
                    elif existing_user.role == 'doctor':
                        msg = "Your doctor account is pending Hospital Admin activation."
                    else:
                        msg = "Please activate your account via the link sent to your email."
                    return Response({"message": msg, "redirect_to": "login.html"}, status=status.HTTP_403_FORBIDDEN)

            user = authenticate(request,username=email,password=password) # if username and password matches in db it sends the user object with all the user fields and if not matches sends only None

            if user is not None:
                if not user.is_active:
                    return Response({
                        "message": "Please activate your account",
                        "redirect_to": "login.html",
                    }, status=status.HTTP_400_BAD_REQUEST)

                refresh = RefreshToken.for_user(user) # generate jwt access and refresh tokens for user and stores in refresh object

                role_redirects = {
                "doctor": "doctor_page.html",
                "donor": "donor_page.html",
                "patient": "patient_page.html",
                "admin": "admin_page.html",
                "hospital":"hospital_page.html"
                }
                
                redirect_path = role_redirects.get(user.role, "home_page.html") # from role_redirects dict get the matching role key send by the user

                return Response({
                    "message": "User logged in successfully",
                    "access": str(refresh.access_token), # token goes in frontend header and passes with every request 
                    "refresh":str(refresh), # used to renew acess token and stored as a secret key in browser and send only to server when access token is expired
                    "redirect_to": redirect_path,
                    "role": user.role,
                    "email": user.email
                }, status=status.HTTP_200_OK)

            else:
                return Response({
                    "message": "Invalid username or password",
                }, status=status.HTTP_400_BAD_REQUEST)

        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordAPIView(APIView):
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data.get('email')
            associated_user = User.objects.filter(email=email, is_active=True).first()

            if associated_user:
                try:
                    uidb64 = urlsafe_base64_encode(force_bytes(associated_user.pk))
                    token = default_token_generator.make_token(associated_user)
                    updation_url = f"{settings.SITE_DOMAIN}/reset_confirm.html?uidb64={uidb64}&token={token}"
                    send_updation_email(associated_user.email,updation_url)
                except Exception as e:
                    print("Reset email sending failed",str(e))

            return Response({
                "message":"If an account exists, link has been sent to your email"
            },status=status.HTTP_200_OK)

        else:
            return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)


class ResetEmailConfirmAPIView(APIView):
    def get(self,request,uidb64,token):
        try:
            uidb = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uidb)

        except(TypeError,OverflowError,ValueError,User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user,token):
            return Response({"message":"Link is valid"},status=status.HTTP_200_OK)
        else:
            return Response({"message":"Reset link is invalid or expired"},status=status.HTTP_400_BAD_REQUEST)

    def put(self,request,uidb64,token):
        try:
            uidb = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uidb)

        except(TypeError,ValueError,OverflowError,User.DoesNotExist):
            user = None
            
        if user is not None and user.is_active and default_token_generator.check_token(user,token):
            
            serializer = ResetPasswordConfirmSerializer(data=request.data)
            if serializer.is_valid():
                new_password = serializer.validated_data.get('password')
                user.set_password(new_password)
                user.save()
                return Response({
                    "message":"Your password has been updated successfully",
                    "redirect_to":"login.html"
                },status=status.HTTP_200_OK)

            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        else:
            return Response({
                "message":"Reset link is invalid or expired",
                "redirect_to":"login.html"
            },status=status.HTTP_400_BAD_REQUEST)  


class ChangePasswordAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self,request):
        user = request.user
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            old_password = serializer.validated_data.get('old_password')
            if not user.check_password(old_password):
                return Response({"old_password": ["Wrong old password."]}, status=status.HTTP_400_BAD_REQUEST)

            new_password = serializer.validated_data.get('new_password')
            user.set_password(new_password)
            user.save()
        
            return Response({
                "message":"Your password has been changed successfully",
                "role":user.role
            },status=status.HTTP_200_OK)

        else:
            return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)


class AdminDashboardAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self,request):
        if request.user.role != 'admin':
            return Response({
                'message':"Access Denied,Admins only"
            },status=status.HTTP_403_FORBIDDEN)

        hospitals = Hospital.objects.prefetch_related('doctors', 'donors', 'patients', 'blood_stock', 'blood_request')
        all_requests = BloodRequest.objects.all()
        completed_count = all_requests.filter(status='completed').count()
        left_count = all_requests.exclude(status__in=['completed','rejected']).count()

        data = {
            "total_hospitals": hospitals.count(),
            "total_doctors": Doctor.objects.count(),
            "total_donors": Donor.objects.count(),
            "total_patients": Patient.objects.count(),
            "total_blood_requests":BloodRequest.objects.count(),
            "completed_requests":completed_count,
            "left_requests":left_count,
            "hospitals": hospitals,
            "all_users": User.objects.all(),
            "blood_requests": BloodRequest.objects.all(),
            "blood_donations": BloodDonation.objects.all(),
        }

        serializer = AdminDashboardSerializer(data) # it converts the models objects inside data dict into serializer object
        return Response(serializer.data,status=status.HTTP_200_OK) # serializer.data converts serializer object into dict and then Response converts it into json string and at last byte stream

class HospitalDashboardAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self,request):

        if request.user.role != 'hospital':
            return Response({
                'message': "Access denied. Only hospitals can view this dashboard."
            }, status=status.HTTP_403_FORBIDDEN)

        try:
            hospital = Hospital.objects.prefetch_related(
                'doctors__user',
                'donors__user',
                'patients__user',
                'blood_stock',
                'blood_request__patient__user',
                'blood_request__assigned_doctor__user',
                'blood_request__accepted_by_donor__user'
            ).get(user=request.user)

            serializer = HospitalDetailSerializer(hospital)
            return Response(serializer.data,status=status.HTTP_200_OK)

        except Hospital.DoesNotExist:
            return Response({
                'message':"Hospital profile not found for this user"
            },status=status.HTTP_404_NOT_FOUND)


class PatientDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request):
        if request.user.role != 'patient':
            return Response({'message':"Access Denied.Pateint only"},status=status.HTTP_403_FORBIDDEN)

        patient = request.user.patient_profile
        hospital = patient.current_hospital

        all_available_stocks = BloodStock.objects.select_related('hospital').filter(
            quantity_in_units__gt=0,
            hospital__is_verified=True  
        ).order_by('blood_group', '-quantity_in_units')

        data = {
            "profile": PatientSerializer(patient).data,
            "hospital_blood_stock": BloodStockSerializer(all_available_stocks, many=True).data,
            "my_requests": BloodRequestSerializer(patient.blood_requests.all().order_by('-created_at'), many=True).data,
        }
        return Response(data, status=status.HTTP_200_OK)


class DoctorDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request):
        if request.user.role != 'doctor':
            return Response({'message':"Access Denied.Only doctor allowed"},status=status.HTTP_403_FORBIDDEN)

        doctor = request.user.doctor_profile
        hospital = doctor.hospital

        data = {
            "profile": DoctorSerializer(doctor).data,
            "hospital_blood_stock": BloodStockSerializer(hospital.blood_stock.all(), many=True).data if hospital else [],
            "hospital_requests": BloodRequestSerializer(hospital.blood_request.all().order_by('-created_at'), many=True).data if hospital else [],
            "my_handled_requests": BloodRequestSerializer(doctor.assigned_blood_requests.all(), many=True).data
        }
        return Response(data, status=status.HTTP_200_OK)


class DonorDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request):
        if request.user.role != 'donor':
            return Response({'message':"Access Denied.Only donor allowed"},status=status.HTTP_403_FORBIDDEN)

        donor = request.user.donor_profile
        matching_requests = BloodRequest.objects.filter(
            blood_group_required = donor.blood_group,
            status = 'approved',
            accepted_by_donor__isnull = True
        ).order_by('-created_at')

        data = {
            "profile": DonorSerializer(donor).data,
            "matching_requests": BloodRequestSerializer(matching_requests, many=True).data,
            "my_accepted_donations": BloodRequestSerializer(donor.accepted_donations.all().order_by('-created_at'), many=True).data
        }
        return Response(data, status=status.HTTP_200_OK)


class BloodRequestListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request):
        user = request.user
        if user.role == 'patient':
            blood_request = BloodRequest.objects.filter(patient = user.patient_profile)
        elif user.role == 'doctor':
            blood_request = BloodRequest.objects.filter(hospital= user.doctor_profile.hospital)
        elif user.role == 'donor':
            donor = user.donor_profile
            blood_request = BloodRequest.objects.filter(blood_group_required = donor.blood_group,status__in=['approved','scheduled','completed'])
        else:
            blood_request = BloodRequest.objects.all()

        serializer = BloodRequestSerializer(blood_request,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)

    def post(self,request):
        if request.user.role != 'patient':
            return Response({'message':"Only patient can register"},status=status.HTTP_403_FORBIDDEN)

        serializer = BloodRequestSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(patient=request.user.pateint_profile)
            return Response(serializer.data,status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)



class DonorAccesptRequestAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self,request,pk):
        if request.user.role != 'donor':
            return Response({'message':"Only donors can accept request"},status=status.HTTP_403_FORBIDDEN)

        try:
            blood_request = BloodRequest.objects.get(pk=pk)
            donor = request.user.donor_profile

            donation_location = request.data.get('donation_location','hospital')
            custom_address = request.data.get('donor_home_address',donor.address)

            blood_request.accepted_by_donor = donor
            blood_request.donation_location = donation_location
            if donation_location == 'home':
                blood_request.donor_home_address = custom_address
            blood_request.save()

            return Response({
                'message':"Request accepted successfully waiting for hospital schedule",
                'data':BloodRequestSerializer(blood_request).data
            },status=status.HTTP_200_OK)

        except BloodRequest.DoesNotExist:
            return Response({
                'message':"Blood request not found"
            },status=status.HTTP_404_NOT_FOUND)


class HospitalSceduleRequestAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self,request,pk):
        if request.user.role not in ['admin','doctor']:
            return Response({'message':"Access Denied"},status=status.HTTP_403_FORBIDDEN)
        try:
            blood_request = BloodRequest.objects.get(pk=pk)

            is_home_allowed = request.data.get('is_home_donation_allowed',False)
            donor_date = request.data.get('donor_appointment_date')
            patient_date = request.data.get('patient_delivery_date')

            blood_request.is_home_donation_allowed = is_home_allowed

            if donor_date:
                blood_request.donor_appointment_date = donor_date
            if patient_date:
                blood_request.patient_delivery_date = patient_date

            blood_request.status = 'scheduled'
            blood_request.save()

            return Response({
                'message':"Schedule updated successfully",
                'data':BloodRequestSerializer(blood_request).data
            },status=status.HTTP_200_OK)

        except BloodRequest.DoesNotExist:
            return Response({'message':"Blood request not found"},status=status.HTTP_404_NOT_FOUND)
    




