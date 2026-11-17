from functools import wraps
from rest_framework.response import Response
from rest_framework import status

def login_role_required(allowed_role):
    def decorator(view_func):
        @wraps(view_func)
        def wrapper_func(request,*args,**kwargs):
            user = request.user
            if user.is_authenticated:
                if user.is_superuser:
                    return view_func(request,*args,**kwargs)
                else:
                    user_role = None
                    if getattr(user,'doctor',False):
                        user_role = 'doctor'
                    elif getattr(user,'donor',False):
                        user_role = 'donor'
                    elif getattr(user,'patient',False):
                        user_role = 'patient'

                    if user_role in allowed_role:
                        return view_func(request,*args,**kwargs)

                    else:
                        return Response({
                            "allowed":False,
                            "message":"Access Denied: Your dont have permission to access this area",
                            "redirect_to":'/login'
                        },status=status.HTTP_403_FORBIDDEN)
            else:
                return Response({
                    "allowed":False,
                    "message":"Authentication required: Please login first",
                    "redirect_to":'/login'
                },status=status.HTTP_401_UNAUTHORIZED)

        return wrapper_func
    return decorator

                    

                



