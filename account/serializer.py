from account.models import User,Donor,Doctor,Hospital,Patient,BloodRequest,BloodStock,BloodDonation
from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from django.db import transaction


class UserSerializer(ModelSerializer):
    confirm_password = serializers.CharField(write_only=True,required=True)
    name = serializers.SerializerMethodField()
    hospital = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ['name','email','password','confirm_password','role','hospital','is_active']
        extra_kwargs = {'password':{'write_only':True},'role':{'read_only':True},'is_active':{'read_only':True}}

    def get_name(self,obj):
        if hasattr(obj,'doctor_profile'):
            return obj.doctor_profile.name
        elif hasattr(obj,'donor_profile'):
            return obj.donor_profile.name
        elif hasattr(obj,'patient_profile'):
            return obj.patient_profile.name
        elif hasattr(obj,'hospital_profile'):
            return obj.hospital_profile.name
        return "Super Admin"

    def get_hospital(self,obj):
        if hasattr(obj,'doctor_profile') and obj.doctor_profile.hospital:
            return obj.doctor_profile.hospital.name
        elif hasattr(obj,'donor_profile') and obj.donor_profile.admit_hospital:
            return obj.donor_profile.admit_hospital.name
        elif hasattr(obj,'patient_profile') and obj.patient_profile.current_hospital:
            return obj.patient_profile.current_hospital.name
        elif hasattr(obj,'hospital_profile'):
            return obj.hospital_profile.name
        return "N/A"

        

    def validate(self,attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'password':"Password and confirm password should match"})
        return attrs
    
    def create(self,validated_data):
        validated_data.pop('confirm_password')
        return User.objects.create_user(**validated_data)


class HospitalSerializer(ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = Hospital
        fields = ['id','user', 'name', 'license_number', 'address', 'city', 'contact_number', 'is_verified']
        extra_kwargs = {'is_verified':{'read_only':True}}
    
    @transaction.atomic
    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user_data.pop('confirm_password')
        user = User.objects.create_user(role='hospital', **user_data)
        return Hospital.objects.create(user=user, **validated_data)

class DoctorSerializer(ModelSerializer):
    user = UserSerializer()
    hospital_details = HospitalSerializer(source='hospital',read_only = True)
    email = serializers.EmailField(source='user.email', read_only=True)
    class Meta:
        model = Doctor
        fields = ['user','name','email','specialization','license_number','hospital','hospital_details','current_blood_group']

    @transaction.atomic
    def create(self,validated_data):
        user_data = validated_data.pop('user')
        user_serializer = UserSerializer(data=user_data)
        user_serializer.is_valid(raise_exception=True)
        user = user_serializer.save(role='doctor')
        return Doctor.objects.create(user=user,**validated_data)


class DonorSerializer(ModelSerializer):
    user = UserSerializer()
    hospital_details = HospitalSerializer(source='admit_hospital', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    class Meta:
        model = Donor
        fields = ['user','name','email','city','blood_group','last_donation_date','address','is_eligible', 'admit_hospital', 'hospital_details', 'disease_history']
        extra_kwargs = {'is_eligible':{'read_only':True}}

    @transaction.atomic
    def create(self,validated_data):
        user_data = validated_data.pop('user')
        user_serializer = UserSerializer(data=user_data)
        user_serializer.is_valid(raise_exception=True)
        user = user_serializer.save(role='donor')
        return Donor.objects.create(user=user,**validated_data)


class PatientSerializer(ModelSerializer):
    user = UserSerializer()
    hospital_details = HospitalSerializer(source='current_hospital', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    class Meta:
        model = Patient
        fields = ['user', 'name','email','city','blood_group_required', 'disease_history', 'current_hospital','hospital_details']

    @transaction.atomic
    def create(self,validated_data):
        user_data = validated_data.pop('user')
        user_serializer = UserSerializer(data=user_data)
        user_serializer.is_valid(raise_exception=True)
        user = user_serializer.save(role='patient')
        return Patient.objects.create(user=user,**validated_data)


class BloodRequestSerializer(ModelSerializer):
    hospital_details = HospitalSerializer(source='hospital', read_only=True)
    patient_details = PatientSerializer(source='patient', read_only=True)
    doctor_details = DoctorSerializer(source='assigned_doctor', read_only=True)
    donor_details = DonorSerializer(source='accepted_by_donor', read_only=True)

    class Meta:
        model = BloodRequest
        fields = '__all__'

    def validate(self, attrs):
        donation_location = attrs.get('donation_location', getattr(self.instance, 'donation_location', 'hospital'))
        donor = attrs.get('accepted_by_donor', getattr(self.instance, 'accepted_by_donor', None))
        home_address = attrs.get('donor_home_address', getattr(self.instance, 'donor_home_address', None))

        if donation_location == 'home' and donor:
            if not home_address and not donor.address:
                raise serializers.ValidationError({
                    "donor_home_address": "For home blood donation address is mandatory"
                })
        return attrs


class BloodStockSerializer(ModelSerializer):
    hospital_details = HospitalSerializer(source='hospital',read_only = True)
    class Meta:
        model = BloodStock
        fields = '__all__'

class BloodDonationSerializer(ModelSerializer):
    hospital_details = HospitalSerializer(source='hospital', read_only=True)
    donor_details = DonorSerializer(source='donor', read_only=True)

    class Meta:
        model = BloodDonation
        fields = '__all__'

    def validate(self, attrs):
        donation_location = attrs.get('donation_location', getattr(self.instance, 'donation_location', 'hospital'))
        donor = attrs.get('donor', getattr(self.instance, 'donor', None))
        home_address = attrs.get('donor_home_address', getattr(self.instance, 'donor_home_address', None))

        if donation_location == 'home' and donor:
            if not home_address and not donor.address:
                raise serializers.ValidationError({
                    "donor_home_address": "For home donation and for donor profile address is mandatory"
                })
        return attrs

class HospitalDetailSerializer(ModelSerializer):
    doctors = DoctorSerializer(many=True, read_only=True)
    donors = DonorSerializer(many=True, read_only=True)
    patients = PatientSerializer(many=True, read_only=True)
    blood_stock = BloodStockSerializer(many=True, read_only=True)
    blood_requests = BloodRequestSerializer(source='blood_request',many=True, read_only=True)

    class Meta:
        model = Hospital
        fields = [
            'id', 'name', 'license_number', 'address', 'city', 'contact_number',
            'is_verified', 'doctors', 'donors', 'patients', 'blood_stock', 'blood_requests'
        ]

class AdminDashboardSerializer(serializers.Serializer):
    admin_name = serializers.CharField(required=False)
    admin_phone = serializers.IntegerField(required=False)
    admin_email = serializers.EmailField(required=False)
    total_hospitals = serializers.IntegerField()
    total_doctors = serializers.IntegerField()
    total_donors = serializers.IntegerField()
    total_patients = serializers.IntegerField()
    total_blood_requests = serializers.IntegerField()
    completed_requests = serializers.IntegerField()
    left_requests = serializers.IntegerField()

    hospitals = HospitalDetailSerializer(many=True, read_only=True)
    all_users = UserSerializer(many=True, read_only=True)
    blood_requests = BloodRequestSerializer(many=True, read_only=True)
    blood_donations = BloodDonationSerializer(many=True, read_only=True)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only = True,required=True)


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)


class ResetPasswordConfirmSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True,min_length=8,required=True)
    confirm_password = serializers.CharField(write_only=True,min_length=8,required=True)

    def validate(self,attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password":"Passwords dont match"})
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True,required=True)
    new_password = serializers.CharField(write_only=True,min_length=8,required=True)
    confirm_password = serializers.CharField(write_only=True,min_length=8,required=True)

    def validate(self,attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password":"Passwords dont match"})
        return attrs

class ProfilePicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['profile_pic']


class ChatBotSerializer(serializers.Serializer):
    input_field = serializers.CharField(max_length=500,trim_whitespace=True,required=True,error_messages={
            "blank": "Please type a message.",
            "max_length": "Please keep your question under 500 characters."
        }
    )

    ALLOWED_KEYWORDS = [
        'blood', 'donate', 'donation', 'donor', 'patient', 'hospital', 'doctor',
        'bloodnation', 'blood nation', 'stock', 'unit', 'units', 'group', 'plasma',
        'platelet', 'platelets', 'rbc', 'hemoglobin', 'eligible', 'eligibility',
        'request', 'emergency', 'transfusion', 'bank', 'register', 'login',
        'dashboard', 'account', 'verify', 'verification', 'appointment', 'home',
        'a+', 'a-', 'b+', 'b-', 'ab+', 'ab-', 'o+', 'o-', 'positive', 'negative',
        'hi', 'hello', 'hey', 'namaste'
    ]

    def validate_input_field(self,value):
        text_lower = value.lower()
        is_matched = False
        for keyword in self.ALLOWED_KEYWORDS:
            if keyword in text_lower:
                is_matched = True
                break

        if not is_matched:
            raise serializers.ValidationError(
                "I am the BloodNation AI Assistant. I can only answer questions related to Blood, BloodNation, Blood Donation, and Blood Availability."
            )
        return value

