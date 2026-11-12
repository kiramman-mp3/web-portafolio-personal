import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { getBaseApiUrl } from '../constants/api-url';

export interface Project {
  id: any;
  title: string;
  shortDescription: string;
  description: string;
  technologies: string[];
  status: 'completado' | 'en-progreso' | 'planificado';
  image: string;
  githubUrl?: string;
  webUrl?: string;
  backendUrl?: string;
  apkUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  private apiUrl = `${getBaseApiUrl()}/projects`;

  constructor(private http: HttpClient) { }

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl);
  }

  getProjectById(id: string | number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  createProject(project: any, token: string): Observable<any> {
    return this.http.post(this.apiUrl, project, {
      headers: { 'x-api-key': token }
    });
  }

  updateProject(id: string, project: any, token: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, project, {
      headers: { 'x-api-key': token }
    });
  }

  deleteProject(id: string, token: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: { 'x-api-key': token }
    });
  }
}
