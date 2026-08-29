import os

# Load local .env variables manually for pytest
base_dir = os.path.dirname(os.path.abspath(__file__))
env_file = os.path.join(base_dir, '.env')
if os.path.exists(env_file):
    with open(env_file) as f:
        for line in f:
            if line.strip() and not line.startswith('#'):
                try:
                    key, val = line.strip().split('=', 1)
                    val = val.strip('\'"')
                    os.environ[key] = val
                except ValueError:
                    pass
