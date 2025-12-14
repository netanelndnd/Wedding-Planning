import { NextRequest, NextResponse } from 'next/server';
import { taskService } from '@/services/firestoreService';
import { Task } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { coupleId, action, task } = await req.json();

    if (action === 'create') {
      const taskId = await taskService.addTask(coupleId, task);
      return NextResponse.json({ taskId }, { status: 201 });
    }

    if (action === 'update') {
      const { taskId, updates } = await req.json();
      await taskService.updateTask(taskId, updates);
      return NextResponse.json({ message: 'Task updated' }, { status: 200 });
    }

    if (action === 'delete') {
      const { taskId } = await req.json();
      await taskService.deleteTask(taskId);
      return NextResponse.json({ message: 'Task deleted' }, { status: 200 });
    }

    if (action === 'changeStatus') {
      const { taskId, status } = await req.json();
      await taskService.changeTaskStatus(taskId, status);
      return NextResponse.json({ message: 'Status changed' }, { status: 200 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Operation failed' },
      { status: 400 }
    );
  }
}
