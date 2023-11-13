from flask import Flask,request
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from flask_cors import CORS


app = Flask(__name__)                   # create a flask application
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://username:password@localhost/database'             # configure the database URI 

db = SQLAlchemy(app)                    # create the db instance by passing the Flask app
CORS(app)

# define the data model Event
class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)                                        # define a column named id, and this column contain unique integer values (primary key)
    description = db.Column(db.String(100), nullable=False)                             # define a string column named description, and this column store text data with a maximum length of 100 characters, and it is required (cannot be null). 
    create_at =db.Column(db.DateTime, nullable=False, default= datetime.utcnow)       # define a datetime column named create_at, required, and default value set to the current UTC time. 

    def __repr__(self):
        return f"Event: {self.description}"
    
    def __init__(self,description):
        self.description = description


# format the event (JSON)
def format_event(event):
    return {
        "description": event.description,
        "id": event.id,
        "create_at": event.create_at
    }

# routes are used to associate functions(view functions) with specific URLs
#  route decorator allows to bind a function to a specific URL pattern, 
#  when a request matches that pattern, flask calls the associated function to generate the response.
@app.route('/')         # define a route for the root URL
def hello():
    return "Hey! How are you doing."

# create an event
@app.route('/events',methods=['POST'])              # response to post request  
def create_event():
    description = request.json['description']       #  extracts the 'description' field from the JSON payload of the incoming POST request.
    event = Event(description)
    db.session.add(event)                           # adds the new event object to the SQLAlchemy session.
    db.session.commit()                             #  commits the changes made in the session to the database.
    return format_event(event)

#  get all event
@app.route('/events',methods=['GET'])
def get_events():
    events = Event.query.order_by(Event.create_at.asc()).all()         # get all events from the database, ordering them by their id in ascending order.
    event_list = []
    for event in events:
        event_list.append(format_event(event))
    return {'event':event_list}

# get a single event by its id via get request
@app.route('/events/<id>', methods=['GET'])
def get_event(id):                                  # takes id as a parameter from the url
    event = Event.query.filter_by(id=id).one()
    formatted_event = format_event(event)
    return {'event': formatted_event}

#  delete an event by its id
@app.route('/events/<id>', methods=['DELETE'])
def delete_event(id):
    event = Event.query.filter_by(id=id).one()
    db.session.delete(event)
    db.session.commit()
    return f'Event (id= {id} ) deleted!'

#  update an event
@app.route('/events/<id>', methods=['PUT'])
def update_event(id):
    event=Event.query.filter_by(id=id)
    description = request.json['description']
    event.update(dict(description=description, create_at=datetime.utcnow()))
    db.session.commit()
    return {'event': format_event(event.one())}

if __name__ == '__main__':
    app.debug = True
    app.run()