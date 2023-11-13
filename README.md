# Baby-Tracker

### requirements
For backend:
cd .\backend\
pip install pipenv
pipenv install flask flask-sqlalchemy psycopg2 python-dotenv flask-cors
pipenv shell

For frontend:
cd .\frontend\
npm i axios date-fns

------------------------------------------
from app import app,db
app.app_context().push()
db.create_all()