// useState is a hook that allows functional components to manage state
// useEffect is a hook that enables to perform side effects in functional components. 
// Side effects refer to code that needs to interact with external world, like fetching data.

import {useEffect, useState} from 'react';
import axios from 'axios';                                      // used for making HTTP requests
import {format} from 'date-fns';                                // working with dates
import './App.css';

const baseUrl = "http://localhost:5000"

function App() {
  // defined several state variables using the useState hook

  // description is a state variable that holds the current value of description
  // setdescription is a function allows we to update the description state
  const [description, setDescription] = useState("");                             
  const [editDescription, setEditDescription] = useState("");
  const [eventsList, setEventsList] = useState([]);
  const [eventId, setEventId] = useState(null);

  const fetchEvents = async() => {
    // make a get request
    const data = await axios.get(`${baseUrl}/events`)
    // event is a array of events
    const { event } = data.data
    // console.log("DATA: ",data)
    // update the eventsList state with the fetched events (event).
    setEventsList(event);
  }
  
  const handleChange = (e,field) =>{
    if (field=='edit'){
      setEditDescription(e.target.value);               // edit description
    }else{
      setDescription(e.target.value);                   
    }
  }

  const handleDelete = async (id) => {
    try{
      // make a delete request
      await axios.delete(`${baseUrl}/events/${id}`);
      // Update the state by filtering out the deleted event
      const updatedList = eventsList.filter(event => event.id != id);
      setEventsList(updatedList);
    } catch(err){
      console.error(err.message);
    }
  }

  const toggleEdit = (event) => {
    // set the eventId to the ID of the provided event
    setEventId(event.id);
    // set the editDescription to the description of the provided event
    setEditDescription(event.description);
  }

  const handleSubmit = async(e) =>{
    // prevents the default form submission behavior,
    e.preventDefault();
    // console.log(description);
    try{
      if(editDescription){
        // editing an existing event and sends a PUT request to update the event
        const data = await axios.put(`${baseUrl}/events/${eventId}`, {description:editDescription});
        const updatedEvent = data.data.event;

        // update the eventsList by replacing the old event with the updated one
        const updatedList = eventsList.map(event =>{
          if(event.id==eventId){
            return event = updatedEvent
          }
          return event
        })
        setEventsList(updatedList)
      }else{
        // if editDescription doesn't exist, it means we are creating a new event
        const data = await axios.post(`${baseUrl}/events`, {description})

        // update the eventsList by adding the new event
        setEventsList([...eventsList,data.data]);
        
      }
      // reset the state values (setDescription, setEditDescription, setEventId) to clear the form or input fields
      setDescription('');
      setEditDescription('');
      setEventId(null);
    }catch(err){
      console.error(err.message);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, [])

  return (
    <div className="App">
      <section>
        {/* section for adding a new event */}
        <form onSubmit={handleSubmit}>
          <label htmlFor='description'>Description</label>
          <input
            onChange={(e) => handleChange(e,'description')}
            type='text'
            name='description'
            id='description'
            placeholder='Describe the event'
            value={description}
          />
          <button type='submit'>Submit</button>
        </form>
      </section>
      <section>
        {/* section for displaying and editing existing events */}
        <ul>
          {eventsList?.map(event =>{
            if (eventId==event.id){
              //  display edit form for the selected event
             return(
              <form onSubmit={handleSubmit} key={event.id}>
                <input
                  onChange={(e) => handleChange(e,'edit')}
                  type='text'
                  name='editDescription'
                  id='editDescription'
                  value={editDescription}
                />
                <button type="submit">Submit</button>
              </form>
             )
            } else{
              return(
                <li style={{display:"flex"}} key={event.id}>
                  {format(new Date(event.create_at),"MM/dd,p")}:{" "}
                  {event.description}
                  <button onClick={() => toggleEdit(event)}>Edit</button>
                  <button onClick={() => handleDelete(event.id)}>X</button>
                </li>
              )
            }
          })}
        </ul>
      </section>
    </div>
  );
}

export default App;
