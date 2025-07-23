
import { useState } from 'react';
import { TaskDashboard } from '@/components/TaskDashboard';
import { TaskList } from '@/components/TaskList';
import { AddTaskDialog } from '@/components/AddTaskDialog';
import { Button } from '@/components/ui/button';
import { Plus, BarChart3, List } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  category: string;
  createdAt: Date;
  dueDate?: Date;
}

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Design new landing page',
      description: 'Create a modern landing page design',
      status: 'in-progress',
      priority: 'high',
      category: 'Design',
      createdAt: new Date('2024-01-15'),
      dueDate: new Date('2024-01-25')
    },
    {
      id: '2',
      title: 'Setup database',
      description: 'Configure PostgreSQL database',
      status: 'completed',
      priority: 'medium',
      category: 'Development',
      createdAt: new Date('2024-01-10'),
      dueDate: new Date('2024-01-20')
    },
    {
      id: '3',
      title: 'Write documentation',
      description: 'Create API documentation',
      status: 'pending',
      priority: 'low',
      category: 'Documentation',
      createdAt: new Date('2024-01-18')
    }
  ]);
  
  const [view, setView] = useState<'dashboard' | 'list'>('dashboard');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const addTask = (newTask: Omit<Task, 'id' | 'createdAt'>) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setTasks(prev => [...prev, task]);
    toast({
      title: 'Task created',
      description: `"${task.title}" has been added to your tasks.`
    });
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
    toast({
      title: 'Task updated',
      description: 'Task has been successfully updated.'
    });
  };

  const deleteTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(task => task.id !== id));
    toast({
      title: 'Task deleted',
      description: `"${task?.title}" has been removed.`
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Task Manager
            </h1>
            <p className="text-gray-600 mt-2">Organize your work and boost productivity</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white rounded-lg shadow-sm border p-1">
              <Button
                variant={view === 'dashboard' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('dashboard')}
                className="gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </Button>
              <Button
                variant={view === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('list')}
                className="gap-2"
              >
                <List className="w-4 h-4" />
                List
              </Button>
            </div>
            
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </Button>
          </div>
        </div>

        {view === 'dashboard' ? (
          <TaskDashboard tasks={tasks} onUpdateTask={updateTask} onDeleteTask={deleteTask} />
        ) : (
          <TaskList tasks={tasks} onUpdateTask={updateTask} onDeleteTask={deleteTask} />
        )}

        <AddTaskDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onAddTask={addTask}
        />
      </div>
    </div>
  );
};

export default Index;
