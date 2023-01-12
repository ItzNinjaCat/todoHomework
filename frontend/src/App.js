import React, { useEffect, useState } from 'react';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';



function App() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [validated, setValidated] = useState(false);
  const [todoTasks, setTodoTasks] = useState([]);
  const [inProgressTasks, setInProgressTasks] = useState([]);
  const [doneTasks, setDoneTasks] = useState([]);
  const [selectedIndexTodo, setSelectedIndexTodo] = useState(undefined);
  const [selectedIndexInProgress, setSelectedIndexInProgress] = useState(undefined);

  function changeTitle(e) {
    setTitle(e.target.value);
  }
  function changeDesc(e) {
    setDesc(e.target.value);
  }
  function handleSubmit(e) {
      const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
      setValidated(true);
    }
    else {
      e.preventDefault();
      e.stopPropagation();
      setValidated(false);
      fetch('http://localhost:3002/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: title,
          description: desc,
          date: new Date().getTime(),
          isInProgress: false,
          completed: false
        }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      }).then(() => {
        setTitle('');
        setDesc('');
      });
    }
  } 

  function toggleSelectTodo(index) {
    if (index === selectedIndexTodo) {
      setSelectedIndexTodo(undefined);
    }
    else {
      setSelectedIndexTodo(index);
    }
  }

  function toggleSelectInProgress(index) {
    if (index === selectedIndexInProgress) {
      setSelectedIndexInProgress(undefined);
    }
    else {
      setSelectedIndexInProgress(index);
    }
  }
  
  function moveToInProgress(index) {
    const task = todoTasks[index];
    fetch(`http://localhost:3002/tasks/${task.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        isInProgress: true,
        completed: false,
        date: task.date
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    }).then(
      setSelectedIndexTodo(undefined)
    );
  }

  function moveToDone(index) {
    const task = inProgressTasks[index];
    fetch(`http://localhost:3002/tasks/${task.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        isInProgress: false,
        completed: true,
        date: task.date
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    }).then(
      setSelectedIndexInProgress(undefined)
    )
  }



  useEffect(() => {
    fetch("http://localhost:3002/tasks").then((response) => {
      response.json().then((data) => {
        const tmpTodo = [];
        const tmpInProgress = [];
        const tmpDone = [];
        data.forEach((task) => {
          if (task.completed) {
            tmpDone.push(task);
          }
          else if (task.isInProgress) {
            tmpInProgress.push(task);
          }
          else {
            tmpTodo.push(task);
          }
        });
        setTodoTasks(tmpTodo);
        setInProgressTasks(tmpInProgress);
        setDoneTasks(tmpDone);
      });
    });
  },);

  return (
    <div className="wrapper">
      <div className="header-wrapper">
          <div className='header'>
            <p className="title ms-8" >Simple Task board</p>
          </div>
      </div>
      <div className="main d-flex ms-10">
            <Col>
              <Form onSubmit={handleSubmit} noValidate validated={validated}>
                <Form.Group as={Col}  className="mb-3 mt-2" controlId="title">
                        <Form.Control 
                            type="text"
                            placeholder="Title"
                            onChange={changeTitle}
                            value={title}
                            maxLength='30'
                            required 
                  />
                  <Form.Control.Feedback type="invalid">
                      Please provide a title.
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} className="mb-3" controlId="description">
                    <Form.Control 
                        as="textarea" 
                        rows={3} 
                        placeholder="Description"
                        onChange={changeDesc}
                        value={desc}
                        required 
                        maxLength='200'
                    />
                    <Form.Control.Feedback type="invalid">
                        Please provide a description.
                    </Form.Control.Feedback>
                </Form.Group>
                <Button className="submitButton" type="submit">
                    Create
                </Button>
              </Form>
            </Col>
            <Col className='d-flex flex-column'>
              <p className="ms-5 title-text">TODO</p>
          <div className='flex-grow-1 rounded border mt-2 m-5 overflow-hidden'>
            {todoTasks.map((task, index) => 
              <div
                key={task.id}
                role="button"
                onClick={() => toggleSelectTodo(index)}
                className={`border task
                ${index === selectedIndexTodo ? 'selected' : null}
                ${index === 0 ? 'rounded-top' : null}
                ${index === todoTasks.length - 1 ? 'rounded-bottom' : null}
                `}>
                <p className='mt-2 d-flex justify-content-between'>
                  <span
                    className={`ms-2 ${index === selectedIndexTodo ? 'selected-title ' : 'card-title'}`}
                  >
                    {task.title}
                  </span>
                  <span 
                    className={`mt-2 me-3 ${index === selectedIndexTodo ? 'selected-time   ' : 'card-time'}`}
                  >
                    {new Date(task.date).toDateString()}
                  </span>
                </p>
                <p
                  className={`mt-2 ms-2 ${index === selectedIndexTodo ? 'selected-description ' : 'card-description'}`}
                >{task.description}</p>
              </div>
            )}
              </div>
        </Col>
        <div className="d-flex align-items-center">
          <Button onClick={() => moveToInProgress(selectedIndexTodo)}
            disabled={selectedIndexTodo === undefined}
            variant="outline-dark"
            size="sm"
          >
            {'>'}
          </Button>
          </div>
            <Col className='d-flex flex-column'>
          <p className="ms-5 title-text">In Progress</p>
          <div className='flex-grow-1 rounded border mt-2 m-5 overflow-hidden'>
            {inProgressTasks.map((task, index) => 
              <div
                key={task.id}
                role="button"
                onClick={() => toggleSelectInProgress(index)}
                className={`border task
                ${index === selectedIndexInProgress ? 'selected' : null}
                ${index === 0 ? 'rounded-top' : null}
                ${index === inProgressTasks.length - 1 ? 'rounded-bottom' : null}
                `}
              >
                <p className='mt-2 d-flex justify-content-between'>
                  <span
                    className={`ms-2 ${index === selectedIndexInProgress ? 'selected-title ' : 'card-title'}`}
                  >
                    {task.title}
                  </span>
                  <span 
                    className={`mt-2 me-3 ${index === selectedIndexInProgress ? 'selected-time   ' : 'card-time'}`}
                  >
                    {new Date(task.date).toDateString()}
                  </span>
                </p>
                <p
                  className={`mt-2 ms-2 ${index === selectedIndexInProgress ? 'selected-description ' : 'card-description'}`}
                >{task.description}</p>
              </div>
            )}
              </div>
        </Col>
        <div className="d-flex align-items-center">
        <Button onClick={() => moveToDone(selectedIndexInProgress)}
          disabled={selectedIndexInProgress === undefined}
          variant="outline-dark"
          size="sm"
        >
          {'>'}
        </Button>
        </div>
            <Col className='d-flex flex-column'>
          <p className="ms-5 title-text">Done</p>
          <div className='flex-grow-1 rounded border mt-2 m-5 overflow-hidden'>
            {doneTasks.map((task, index) => 
              <div key={task.id}
                className={`task border done-card
                ${index === 0 ? 'rounded-top' : null}
                ${index === doneTasks.length - 1 ? 'rounded-bottom' : null}
              `}>
                <p className='mt-2 d-flex justify-content-between'>
                  <span
                    className="ms-2 card-title"
                  >
                    {task.title}
                  </span>
                  <span 
                    className="mt-2 me-3 card-time"
                  >
                    {new Date(task.date).toDateString()}
                  </span>
                </p>
                <p
                  className="mt-2 ms-2 card-description"
                >{task.description}</p>
              </div>
            )}
              </div>
            </Col>
          </div>
      </div>
  );
}

export default App;
