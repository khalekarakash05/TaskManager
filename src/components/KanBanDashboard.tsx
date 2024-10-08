"use client"

import axios from 'axios';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { DropdownMenuRadio } from './DropDownRadio';
import { UpdateDialog } from './UpdateTaskDialog';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { FaRegEdit } from 'react-icons/fa';

export function KanBanDashboard() {
  const { data: session, status } = useSession();
  const [todoTasks, setTodoTasks] = useState<any[]>([]);
  const [inProgressTasks, setInProgressTasks] = useState<any[]>([]);
  const [completedTasks, setCompletedTasks] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortCriteria, setSortCriteria] = useState<'createdAt' | 'lastUpdated'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);


  if(tasks){
    console.log(tasks);
  }

  useEffect(() => {
    if (status === 'authenticated') {
      axios.get('/api/get-all-tasks')
        .then(response => {
          const tasks = response.data.tasks;
          const sortedTasks = sortTasks(tasks, sortCriteria, sortOrder);
          setTasks(sortedTasks);
          setTodoTasks(sortedTasks.filter((task: { status: string; }) => task.status === 'ToDo'));
          setInProgressTasks(sortedTasks.filter((task: { status: string; }) => task.status === 'InProgress'));
          setCompletedTasks(sortedTasks.filter((task: { status: string; }) => task.status === 'Completed'));
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching tasks:', err.response || err);
          setError('Failed to load tasks');
          setLoading(false);
        });
    }
  }, [status, sortCriteria, sortOrder]);

  const sortTasks = (tasks: any[], criteria: 'createdAt' | 'lastUpdated', order: 'asc' | 'desc') => {
    return tasks.slice().sort((a, b) => {
      const dateA = new Date(a[criteria]);
      const dateB = new Date(b[criteria]);
  
      if (order === 'asc') {
        return dateA.getTime() - dateB.getTime();
      } else {
        return dateB.getTime() - dateA.getTime();
      }
    });
  };


  const handleStatusChange = (taskId: string, newStatus: string) => {
    setTodoTasks(prevTasks => prevTasks.map(task =>
      task._id === taskId ? { ...task, status: newStatus } : task
    ));
    setInProgressTasks(prevTasks => prevTasks.map(task =>
      task._id === taskId ? { ...task, status: newStatus } : task
    ));
    setCompletedTasks(prevTasks => prevTasks.map(task =>
      task._id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  // console.log("tasks:- ", tasks);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if(!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    
    
    try {

      const updatedTodoTasks = [...todoTasks];
      const updatedInProgressTasks = [...inProgressTasks];
      const updatedCompletedTasks = [...completedTasks];

      const [movedTask] = (
        source.droppableId === 'ToDo' ? updatedTodoTasks :
        source.droppableId === 'InProgress' ? updatedInProgressTasks :
        updatedCompletedTasks
      ).splice(source.index, 1);

      if (!movedTask) {
        console.error('No task found at the source index:', source.index);
        return;
      }

      movedTask.status = destination.droppableId;

      if (destination.droppableId === 'ToDo') {
        updatedTodoTasks.splice(destination.index, 0, movedTask);
      } else if (destination.droppableId === 'InProgress') {
        updatedInProgressTasks.splice(destination.index, 0, movedTask);
      } else {
        updatedCompletedTasks.splice(destination.index, 0, movedTask);
      }
      // updatedTasks.splice(destination.index, 0, movedTask);
      // setTasks(updatedTasks);

      setTodoTasks(updatedTodoTasks);
      setInProgressTasks(updatedInProgressTasks);
      setCompletedTasks(updatedCompletedTasks);

      console.log("Moved Task: ", movedTask);
      axios
        .patch(`/api/change-status/${movedTask._id}`, {status: movedTask.status})
        .then((response) => {
          console.log("Task Updated", response.data);
        })
        .catch((error) => {
          console.error("Error updating task status: ", error);
        });
    } catch (error) {
      console.error("Error Updating Task Status: ", error);
    }

  };

  // const getColumnTasks = (status: string) => tasks.filter(task => task.status === status);

  // const getColumnTasks = (status: string) => {
  //   const filteredTasks = tasks.filter(task => task.status === status);
  //   return filteredTasks;
  // };

  if (typeof window === "undefined") {
    return null;
  }

  // const handleSaveTask = (updatedTask: any) => {
  //   axios.put(`/api/update-task/${updatedTask._id}`, updatedTask)
  //     .then((response) => {
  //       setTasks(tasks.map(t => t._id === updatedTask._id ? updatedTask : t));
  //       handleCloseDialog();
  //     })
  //     .catch((err) => {
  //       console.error('Error updating task:', err);
  //     });
  // };

  const handleOpenDialog = (task: any) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedTask(null);
  };
  if(loading){
    return <div>Loading...</div>;
  }
  if(!session){
    console.log("Session: ", session);
  }

  return (
    <div>
      <div className='m-4 mx-auto flex items-center justify-center'>
        <label htmlFor="sortCriteria" className='mr-2'>Sort By:</label>
        <select
          id="sortCriteria"
          value={sortCriteria}
          onChange={(e) => setSortCriteria(e.target.value as 'createdAt' | 'lastUpdated')}
          className='mr-4'
        >
          <option value="createdAt">Created At</option>
          <option value="lastUpdated">Last Updated</option>
        </select>
        <label htmlFor="sortOrder" className='mr-2'>Order:</label>
        <select
          id="sortOrder"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        
        <div className='grid grid-cols-3 text-center border-2 w-4/5 mx-auto gap-2 m-2'>


          {/* ToDo Tasks */}
          <Droppable droppableId="ToDo">
            {(provided) => (
              <div className='m-2' ref={provided.innerRef} {...provided.droppableProps}>
                <h2 className='bg-amber-400 mb-2 w-fit text-center mx-auto p-2 rounded-sm hover:bg-amber-500'>ToDo Tasks</h2>
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {todoTasks.map((task, index) => (
                    <Draggable key={task._id.toString()} draggableId={task._id.toString()} index={index}>
                      {(provided) => (
                        <div
                          className='flex border flex-col min-h-36 p-4 rounded-lg mb-2'
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <div className='flex items-center justify-between'>
                            <p className='font-bold text-left'>{task.title}</p>
                            {/* <button><UpdateDialog currTitle={task.title} taskId={task._id} currDesc={task.description} currStatus={task.status} currPriority={task.priority} /></button> */}
                            <button onClick={() => handleOpenDialog(task)}>
                          {/* <FaRegEdit /> Edit icon */}
                          <FaRegEdit></FaRegEdit>
                        </button>
                          </div>
                          <p className='font-medium text-gray-500 text-left'>{task.description || "No Description"}</p>
                          <DropdownMenuRadio
                            taskId={task._id}
                            currentState={task.status}
                            secondState="InProgress"
                            thirdState="Completed"
                            onStatusChange={(newStatus) => handleStatusChange(task._id, newStatus)}
                          />
                          <p>Priority: {task.priority}</p>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
              
            )}
          </Droppable>


          {/* In Progress Tasks */}
          <Droppable droppableId="InProgress">
            {(provided) => (
              <div className='m-2'>
                <h2 className='bg-blue-400 mb-2 w-fit text-center mx-auto p-2 rounded-sm hover:bg-blue-500'>InProgress Tasks</h2>
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {inProgressTasks.map((task, index) => (
                    <Draggable key={task._id} draggableId={task._id.toString()} index={index}>
                      {(provided) => (
                        <div
                          className='flex border flex-col min-h-36 p-4 rounded-lg mb-2'
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <div className='flex items-center justify-between'>
                          <p className='font-bold text-left'>{task.title}</p>
                          <button onClick={() => handleOpenDialog(task)}>
                          {/* <FaRegEdit /> Edit icon */}
                          <FaRegEdit></FaRegEdit>
                        </button>
                        </div>
                          <p className='font-medium text-gray-500 text-left'>{task.description || "No Description"}</p>
                          <DropdownMenuRadio
                            taskId={task._id}
                            currentState={task.status}
                            secondState="ToDo"
                            thirdState="Completed"
                            onStatusChange={(newStatus) => handleStatusChange(task._id, newStatus)}
                          />
                          <p>Priority: {task.priority}</p>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>

          {/* Completed Tasks */}
          <Droppable droppableId="Completed">
            {(provided) => (
              <div className='m-2'>
                <h2 className='bg-green-400 mb-2 w-fit text-center mx-auto p-2 rounded-sm hover:bg-green-500'>Completed Tasks</h2>
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {completedTasks.map((task, index) => (
                    <Draggable key={task._id} draggableId={task._id.toString()} index={index}>
                      {(provided) => (
                        <div
                          className='flex border flex-col min-h-36 p-4 rounded-lg mb-2'
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <p className='font-bold text-left'>{task.title}</p>
                          <p className='font-medium text-gray-500 text-left'>{task.description || "No Description"}</p>
                          <p>Priority: {task.priority}</p>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>

        </div>
      </DragDropContext>

      {selectedTask && (
        <UpdateDialog
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          task={selectedTask}
          // onSave={handleSaveTask}
        />
      )}
    </div>
  );
}

export default KanBanDashboard;
