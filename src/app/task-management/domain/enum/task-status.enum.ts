/**
 * Estados visibles de una tarea.
 * - PENDING: asignada pero no completada y no vencida.
 * - COMPLETED: entregada por el colaborador.
 * - DELAYED: pendiente cuyo dueDate ya pasó (se computa en runtime).
 */
export enum TaskStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  DELAYED = 'delayed'
}
