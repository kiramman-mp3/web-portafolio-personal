import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { getBaseApiUrl } from '../constants/api-url';

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issuerIcon?: string;
  date: string;
  category: 'web' | 'backend' | 'cloud' | 'database' | 'mobile' | 'security' | 'network' | 'support' | 'iot' | string;
  credentialId: string;
  credentialUrl?: string | null;
  description: string;
  skills: string[];
  hours: number;
  image?: string | null;
  expirationDate?: string | null;
  featured?: boolean;
}

export interface CertificateStats {
  totalCertificates: number;
  totalHours: number;
  verifiedPercentage: number;
  specialtiesCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class CertificatesService {
  private apiUrl = `${getBaseApiUrl()}/certificates`;

  constructor(private http: HttpClient) {}

  getCertificates(): Observable<Certificate[]> {
    return this.http.get<Certificate[]>(this.apiUrl);
  }

  getCertificateById(id: string): Observable<Certificate | undefined> {
    return this.http.get<Certificate>(`${this.apiUrl}/${id}`);
  }

  createCertificate(certificate: any, token: string): Observable<any> {
    return this.http.post(this.apiUrl, certificate, {
      headers: { 'x-api-key': token }
    });
  }

  updateCertificate(id: string, certificate: any, token: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, certificate, {
      headers: { 'x-api-key': token }
    });
  }

  deleteCertificate(id: string, token: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: { 'x-api-key': token }
    });
  }

  getStats(certificatesList: Certificate[]): Observable<CertificateStats> {
    const list = certificatesList;
    const totalHours = list.reduce((acc, c) => acc + (c.hours || 0), 0);
    const uniqueCategories = new Set(list.map((c) => c.category));

    return of({
      totalCertificates: list.length,
      totalHours,
      verifiedPercentage: 100,
      specialtiesCount: uniqueCategories.size
    });
  }
}
