import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { getBaseApiUrl } from '../constants/api-url';

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  extendedInfo: string[];
  technologies?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ServicesService {
  private apiUrl = `${getBaseApiUrl()}/services`;

  constructor(private http: HttpClient) { }

  getServices(): Observable<ServiceItem[]> {
    return this.http.get<ServiceItem[]>(this.apiUrl);
  }

  createService(service: any, token: string): Observable<any> {
    return this.http.post(this.apiUrl, service, {
      headers: { 'x-api-key': token }
    });
  }

  updateService(id: string, service: any, token: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, service, {
      headers: { 'x-api-key': token }
    });
  }

  deleteService(id: string, token: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: { 'x-api-key': token }
    });
  }
}
