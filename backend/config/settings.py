import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load local .env variables manually to ensure they are available before Django settings are evaluated
env_file = BASE_DIR / '.env'
if env_file.exists():
    with open(env_file) as f:
        for line in f:
            if line.strip() and not line.startswith('#'):
                try:
                    key, val = line.strip().split('=', 1)
                    val = val.strip('\'"')
                    os.environ[key] = val
                except ValueError:
                    pass

SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-swachsahyog-dev-key-change-in-prod')

DEBUG = os.environ.get('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '*').split(',')

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.gis',  # Enabled PostGIS Support
    
    # Third-party apps
    'rest_framework',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',

    # Swachsahyog Local Apps
    'core',
    'apps.accounts',
    'apps.geography',
    'apps.authorities',
    'apps.evidence',
    'apps.incidents',
    'apps.aggregation',
    'apps.prioritization',
    'apps.ai_analysis',
    'apps.workflow',
    'apps.notifications',
    'apps.analytics',
    'apps.audit',
    'apps.surplus',
    'apps.activity',
    'apps.impact',
    'apps.messaging',
    'apps.agriculture',
    'apps.waste_app',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

# Database configuration (PostgreSQL + PostGIS)
# Uses django.contrib.gis.db.backends.postgis
DB_NAME = os.environ.get('DB_NAME', 'swc_db')
DB_USER = os.environ.get('DB_USER', 'postgres')
DB_PASSWORD = os.environ.get('DB_PASSWORD', 'postgres')
DB_HOST = os.environ.get('DB_HOST', 'localhost')
DB_PORT = os.environ.get('DB_PORT', '5432')

DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': DB_NAME,
        'USER': DB_USER,
        'PASSWORD': DB_PASSWORD,
        'HOST': DB_HOST,
        'PORT': DB_PORT,
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'  # Standard Indian Time
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# DRF Configurations
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'EXCEPTION_HANDLER': 'core.exceptions.custom_exception_handler',
    'DEFAULT_PAGINATION_CLASS': 'core.pagination.StandardResultsSetPagination',
}

# CORS settings
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]
CORS_ALLOW_CREDENTIALS = True

# Simple JWT Configuration
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# Gemini API Integration Settings
AI_ANALYSIS_ENABLED = os.environ.get('AI_ANALYSIS_ENABLED', 'True') == 'True'
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', None)

# Custom User Model
AUTH_USER_MODEL = 'accounts.User'

# Auto-detect OSGeo4W GeoDjango libraries on Windows
if os.name == 'nt':
    import os
    osgeo4w_paths = [
        os.path.expandvars(r'%LOCALAPPDATA%\Programs\OSGeo4W'),
        r'C:\OSGeo4W',
        r'C:\OSGeo4W64',
    ]
    for path in osgeo4w_paths:
        if os.path.exists(path):
            bin_dir = os.path.join(path, 'bin')
            os.environ['PATH'] = bin_dir + ';' + os.environ['PATH']
            
            # Find the actual gdal.dll in bin/
            gdal_dll = None
            try:
                for f in os.listdir(bin_dir):
                    if f.startswith('gdal') and f.endswith('.dll') and 'plugin' not in f.lower():
                        gdal_dll = os.path.join(bin_dir, f)
                        break
            except Exception:
                pass

            if gdal_dll:
                GDAL_LIBRARY_PATH = gdal_dll
            else:
                GDAL_LIBRARY_PATH = os.path.join(bin_dir, 'gdal308.dll')
                
            GEOS_LIBRARY_PATH = os.path.join(bin_dir, 'geos_c.dll')
            os.environ['GDAL_DATA'] = os.path.join(path, 'share', 'gdal')
            # Look for projlib or share/proj
            proj_lib = os.path.join(path, 'share', 'proj')
            if not os.path.exists(proj_lib):
                proj_lib = os.path.join(path, 'share', 'projlib')
            os.environ['PROJ_LIB'] = proj_lib
            
            print(f"--- OSGeo4W GeoDjango Auto-configured at: {path} ---")
            break

