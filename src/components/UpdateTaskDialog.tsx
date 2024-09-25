"use client";

import {
  Dialog as UIDialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DatePickerDemo } from "@/components/DatePicker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import axios from "axios";

interface UpdateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: {
    _id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
  };
}

export function UpdateDialog({ isOpen, onClose, task }: UpdateDialogProps) {
  // Form States
  const [title, setTitle] = useState<string>(task?.title);
  const [description, setDescription] = useState<string>(task?.description);
  const [taskStatus, setTaskStatus] = useState<string>(task?.status);
  const [priority, setPriority] = useState<string>(task?.priority);
  const [dueDate, setDueDate] = useState<Date>();

  useEffect(() => {
    if (isOpen) {
      setTitle(task.title);
      setDescription(task.description);
      setTaskStatus(task.status);
      setPriority(task.priority);
    }
  }, [task, isOpen]);

  const handleSaveChanges = () => {
    const updatedTask = {
      title,
      description,
      status: taskStatus,
      priority,
      dueDate,
    };

    axios
      .patch(`/api/update-task/${task._id}`, updatedTask)
      .then((response) => {
        console.log("Task updated:", response.data);
        onClose(); // Close the dialog after saving changes
      })
      .catch((err) => {
        console.error("Error updating task:", err);
      });
  };

  return (
    <UIDialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-500 text-white">
        <DialogHeader>
          <DialogTitle>Update Task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title">Title</Label>
            <Input
              required
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status">Status</Label>
            <Select value={taskStatus} onValueChange={setTaskStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="ToDo">ToDo</SelectItem>
                <SelectItem value="InProgress">InProgress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger id="priority">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dueDate">Due Date</Label>
            {/* DatePicker Component */}
            <DatePickerDemo value={dueDate ? dueDate.toISOString().split("T")[0] : ""} 
              onChange={setDueDate}  />
          </div>
        </div>
        <DialogFooter>
          <Button className="border-2" onClick={handleSaveChanges}>
            Update Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </UIDialog>
  );
}