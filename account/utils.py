from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from threading import Thread


class SendEmailThread(Thread):
    def __init__(self,email):
        super().__init__() # initialise the new thread
        self.email = email

    def run(self): # python runs the code inside it when we start thread
        self.email.send(fail_silently=False) # sends the email object to the user


def send_activation_email(recipient_email,activation_url,subject=None):
    if subject is None:
        subject = "Activate your account on: "+ settings.SITE_NAME
    from_email =  getattr(settings,'DEFAULT_FROM_EMAIL','noreply@something.com')
    to_email = [recipient_email]

    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                <div style="text-align: center; margin-bottom: 15px; font-size: 26px; font-weight: 700; color: purple;">
                    Blood<span style="color: purple;">Nation</span> <span style="color: red; font-size: 20px;">❤️</span>
                </div>
                <h2 style="color: #2c3e50;text-align: center;">Welcome to Our Platform!</h2>
                <p>Thank you for registering. Please click the button below to verify and activate your account:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{activation_url}" 
                       style="background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">
                       Activate Account
                    </a>
                </div>
                <p style="font-size: 12px; color: #7f8c8d;">If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="font-size: 12px; color: #3498db; word-break: break-all;">{activation_url}</p>
            </div>
        </body>
    </html>
    """

    # create a plain text by cutting the tags for clients that dont support html version
    text_content = strip_tags(html_content)

    # create email object
    email=EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=from_email,
        to=to_email
    )

    # attach email content
    email.attach_alternative(html_content,"text/html")
    # inititalise and start thread
    SendEmailThread(email).start()





def send_updation_email(recipient_email,updation_url,subject=None):
    if subject is None:
        subject = "Update your password on: "+ settings.SITE_NAME
    from_email =  getattr(settings,'DEFAULT_FROM_EMAIL','noreply@something.com')
    to_email = [recipient_email]

    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                    <div style="text-align: center; margin-bottom: 15px; font-size: 26px; font-weight: 700; color: purple;">
                    Blood<span style="color: purple;">Nation</span> <span style="color: red; font-size: 20px;">❤️</span>
                    </div>
                <h2 style="color: #2c3e50; text-align: center;">Always ready to help you</h2>
                <p>Please click the button below to verify and update your password:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{updation_url}" 
                       style="background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">
                       Update
                    </a>
                </div>
                <p style="font-size: 12px; color: #7f8c8d;">If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="font-size: 12px; color: #3498db; word-break: break-all;">{updation_url}</p>
            </div>
        </body>
    </html>
    """

    # create a plain text by cutting the tags for clients that dont support html version
    text_content = strip_tags(html_content)

    # create email object
    email=EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=from_email,
        to=to_email
    )

    # attach email content
    email.attach_alternative(html_content,"text/html")
    # inititalise and start thread
    SendEmailThread(email).start()
