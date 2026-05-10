import {BaseEntity} from './base-entity';
import {BaseResource, BaseResponse} from './base-response';
import {BaseAssembler} from './base-assembler';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, map, Observable, throwError} from 'rxjs';

/**
 * Provide generic CRUD operations for a single REST endpoint
 * @typeParam TEntity - Domain entity handles by the endpoint.
 * @typeParam TResource - Resource representation exchanged with the API
 * @typeParam TResponse - Response envelope returned for collection queries.
 * @typeParam TAssembler - Mapper that translates between entities and resources
 */
export abstract class BaseApiEndpoint<
  TEntity extends BaseEntity,
  TResource extends BaseResource,
  TResponse extends BaseResponse,
  TAssembler extends BaseAssembler<TEntity, TResource, TResponse>
> {

  protected constructor(
    protected http: HttpClient,
    protected endpointUrl: string,
    protected assembler: TAssembler
  ) {}

  /**
   * Fetches all entities from the configured endpoint.
   * @returns Stream with the mapped entity collection
   */
  getAll(): Observable<TEntity[]> {
    return this.http.get<TResponse | TResource[]>(this.endpointUrl).pipe(
      map( response => {
        console.log(response);
        if (Array.isArray(response)) {
          return response.map(resource => this.assembler.toEntityFromResource(resource));
        }
        return this.assembler.toEntitiesFromResponse(response as TResponse);
      }),
      catchError(this.handleError('Failed to fetch all entities'))
    );
  }

  /**
   * Fetches a single entity by identifier
   * @param id - Entity identifier
   * @returns Stream with the mapped entity
   */
  getById(id: string): Observable<TEntity> {
    return this.http.get<TResource>(`${this.endpointUrl}/${id}`).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Failed to fetch entity with id: ' + id))
    );
  }
  /**
   * Creates a new entity in the remote endpoint
   * @param entity - Entity to persist
   * @returns Stream with the created entity returned by the API
   */
  create(entity: TEntity): Observable<TEntity> {
    const resource = this.assembler.toResourceFromEntity(entity);
    return this.http.post<TResource>(this.endpointUrl, resource).pipe(
      map(created => this.assembler.toEntityFromResource(created)),
      catchError(this.handleError('Failed to create entity' ))
    );
  }
  /**
   * Updates an existing entity
   * @param entity - Entity to state to persist
   * @param id - Identifier of the target entity
   * @returns Stream with the updated entity returned by the API
   */
  update(entity: TEntity, id: string): Observable<TEntity> {
    const resource = this.assembler.toResourceFromEntity(entity);
    return this.http.put<TResource>(`${this.endpointUrl}/${id}`, resource).pipe(
      map(updated => this.assembler.toEntityFromResource(updated)),
      catchError(this.handleError('Failed to update entity'))
    );
  }

  /**
   * Delete an existing entity
   * @param id - Identifier of the entity to remove
   * @returns Completion stream for the delete operation
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpointUrl}/${id}`).pipe(
      catchError(this.handleError('Failed to delete entity with id: ' + id))
    )
  }

  protected handleError(operation: string){
    return (error: HttpErrorResponse): Observable<never> => {
      let errorMessage = operation;
      if (error.status === 404) {
        errorMessage = `${operation}: Resource not found`;
      } else if (error.error instanceof ErrorEvent) {
        errorMessage = `${operation}: ${error.error.message}`;
      } else {
        errorMessage = `${operation}: ${error.statusText || 'Unexcepted error'}`;
      }
      return throwError(()=>new Error(errorMessage));
    }
  }
}
