import { NextRequest, NextResponse } from 'next/server';
import { taskService } from '@/services/crud';
import { Task } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { coupleId, action, task, taskId, updates, status } = body;

    if (action === 'create') {
      const result = await taskService.add(coupleId, task);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ taskId: result.data }, { status: 201 });
    }

    if (action === 'update') {
      const result = await taskService.update(taskId, updates);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ message: 'Task updated' }, { status: 200 });
    }

    if (action === 'delete') {
      const result = await taskService.delete(taskId);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ message: 'Task deleted' }, { status: 200 });
    }

    if (action === 'changeStatus') {
      const result = await taskService.changeStatus(taskId, status);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
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
