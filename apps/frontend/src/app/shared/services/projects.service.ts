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
  images?: string[];
  githubUrl?: string;
  webUrl?: string;
  backendUrl?: string;
  apkUrl?: string;
}

export function getProjectImages(project?: Pick<Project, 'image' | 'images'> | null): string[] {
  if (!project) return [];
  const list = Array.isArray(project.images)
    ? project.images.map(img => img?.trim()).filter((img): img is string => Boolean(img))
    : [];
  if (list.length > 0) {
    return list;
  }
  const cover = project.image?.trim();
  return cover ? [cover] : [];
}

export function getProjectCover(project?: Pick<Project, 'image' | 'images'> | null): string {
  const images = getProjectImages(project);
  return images[0] || '';
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
