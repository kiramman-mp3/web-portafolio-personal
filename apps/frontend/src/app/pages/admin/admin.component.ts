import { Component, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ServicesService, ServiceItem } from '../../shared/services/services.service';
import { ProjectsService, Project, getProjectImages } from '../../shared/services/projects.service';
import { CertificatesService, Certificate } from '../../shared/services/certificates.service';
import { ContactService, ContactMessage } from '../../shared/services/contact.service';
import { TECH_MASTER_LIST } from '../../shared/constants/tech-list';
import { getBaseApiUrl } from '../../shared/constants/api-url';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownPipe],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  // Signals: OnPush is the default, so state set from async callbacks must notify the view
  isLoggedIn = signal(false);
  password = '';
  loginError = signal('');

  activeTab: 'services' | 'projects' | 'certificates' | 'contacts' = 'services';
  editorMode: 'write' | 'preview' = 'write';
  
  services = signal<ServiceItem[]>([]);
  projects = signal<Project[]>([]);
  certificates = signal<Certificate[]>([]);
  contacts = signal<ContactMessage[]>([]);
  selectedContactMessage = signal<ContactMessage | null>(null);
  showContactModal = signal(false);
  
  token = signal('');

  // Tech list from constants
  techMasterList = TECH_MASTER_LIST;
  selectedTechnologies: string[] = [];
  customTechName = '';

  // Form states
  showServiceModal = signal(false);
  showProjectModal = signal(false);
  showCertificateModal = signal(false);
  isEditingService = false;
  isEditingProject = false;
  isEditingCertificate = false;

  serviceForm = {
    id: '',
    title: '',
    description: '',
    imageUrl: '',
    imageAlt: '',
    extendedInfoStr: ''
  };

  projectForm = {
    id: '',
    title: '',
    shortDescription: '',
    description: '',
    image: '',
    images: [] as string[],
    status: 'completado' as 'completado' | 'en-progreso' | 'planificado',
    githubUrl: '',
    webUrl: '',
    backendUrl: '',
    apkUrl: ''
  };
  newProjectImageUrl = '';

  certificateForm = {
    id: '',
    title: '',
    issuer: '',
    issuerIcon: 'fas fa-certificate',
    date: '',
    category: 'web',
    credentialId: '',
    credentialUrl: '',
    description: '',
    hours: 0,
    image: '',
    expirationDate: ''
  };

  constructor(
    private servicesService: ServicesService,
    private projectsService: ProjectsService,
    private certificatesService: CertificatesService,
    private contactService: ContactService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('admin_token');
      if (savedToken) {
        this.token.set(savedToken);
        // Verify saved session token with backend
        this.http.get<any>(`${getBaseApiUrl()}/admin/verify`, {
          headers: { 'x-api-key': savedToken }
        }).subscribe({
          next: () => {
            this.isLoggedIn.set(true);
            this.loadData();
          },
          error: (err) => {
            if (err?.status === 401) {
              console.warn('Sesión de administrador inválida o expirada.');
              this.onLogout();
            } else {
              this.isLoggedIn.set(true);
              this.loadData();
            }
          }
        });
      }
    }
  }

  onLogin(): void {
    this.loginError.set('');
    this.http.post<any>(`${getBaseApiUrl()}/admin/login`, { password: this.password })
      .subscribe({
        next: (res) => {
          if (res && res.success && res.token) {
            this.token.set(res.token);
            if (typeof window !== 'undefined') {
              localStorage.setItem('admin_token', res.token);
            }
            this.isLoggedIn.set(true);
            this.loadData();
          }
        },
        error: (err) => {
          console.error(err);
          this.loginError.set(err?.status === 0
            ? 'No se pudo conectar con el servidor.'
            : err?.error?.message || 'Contraseña incorrecta');
        }
      });
  }

  onLogout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
    }
    this.token.set('');
    this.isLoggedIn.set(false);
    this.services.set([]);
    this.projects.set([]);
    this.certificates.set([]);
    this.contacts.set([]);
    this.selectedContactMessage.set(null);
    this.showContactModal.set(false);
  }

  loadData(): void {
    this.servicesService.getServices().subscribe({ next: data => this.services.set(data), error: () => this.services.set([]) });
    this.projectsService.getProjects().subscribe({ next: data => this.projects.set(data), error: () => this.projects.set([]) });
    this.certificatesService.getCertificates().subscribe({ next: data => this.certificates.set(data), error: () => this.certificates.set([]) });
    this.loadContacts();
  }

  // IMAGE UPLOAD WITH COMPRESSION
  private compressImageFile(file: File, maxW = 800, maxH = 600, quality = 0.75): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxW) {
              height *= maxW / width;
              width = maxW;
            }
          } else {
            if (height > maxH) {
              width *= maxH / height;
              height = maxH;
            }
          }

          canvas.width = Math.round(width);
          canvas.height = Math.round(height);

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context unavailable'));
            return;
          }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  onImageSelected(event: any, type: 'service' | 'project' | 'certificate'): void {
    const file = event.target.files?.[0];
    if (!file) return;

    this.compressImageFile(file).then((compressedBase64) => {
      if (type === 'service') {
        this.serviceForm.imageUrl = compressedBase64;
      } else if (type === 'project') {
        this.projectForm.images.push(compressedBase64);
        this.projectForm.image = this.projectForm.images[0] || '';
      } else {
        this.certificateForm.image = compressedBase64;
      }
      this.cdr.markForCheck();
    }).catch((err) => console.error('Image compression failed', err));
  }

  async onProjectImagesSelected(event: any): Promise<void> {
    const files: FileList | null = event.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      try {
        const compressed = await this.compressImageFile(file, 1280, 800, 0.8);
        this.projectForm.images.push(compressed);
      } catch (err) {
        console.error('Error compressing project image:', err);
      }
    }
    this.projectForm.image = this.projectForm.images[0] || '';
    event.target.value = '';
    this.cdr.markForCheck();
  }

  addProjectImageUrl(): void {
    const trimmed = this.newProjectImageUrl.trim();
    if (!trimmed) return;
    if (!this.projectForm.images.includes(trimmed)) {
      this.projectForm.images.push(trimmed);
      this.projectForm.image = this.projectForm.images[0] || '';
    }
    this.newProjectImageUrl = '';
  }

  removeProjectImage(index: number): void {
    this.projectForm.images.splice(index, 1);
    this.projectForm.image = this.projectForm.images[0] || '';
  }

  moveProjectImage(index: number, delta: number): void {
    const target = index + delta;
    if (target < 0 || target >= this.projectForm.images.length) return;
    const [item] = this.projectForm.images.splice(index, 1);
    this.projectForm.images.splice(target, 0, item);
    this.projectForm.image = this.projectForm.images[0] || '';
  }

  setProjectCoverImage(index: number): void {
    if (index <= 0 || index >= this.projectForm.images.length) return;
    const [item] = this.projectForm.images.splice(index, 1);
    this.projectForm.images.unshift(item);
    this.projectForm.image = this.projectForm.images[0] || '';
  }

  getProjectImageCount(project: Project): number {
    return getProjectImages(project).length;
  }

  // TECH MULTISELECT ACTIONS
  toggleTechnology(techName: string): void {
    const idx = this.selectedTechnologies.indexOf(techName);
    if (idx > -1) {
      this.selectedTechnologies.splice(idx, 1);
    } else {
      this.selectedTechnologies.push(techName);
    }
  }

  isTechSelected(techName: string): boolean {
    return this.selectedTechnologies.includes(techName);
  }

  addCustomTechnology(): void {
    const trimmed = this.customTechName.trim();
    if (trimmed && !this.selectedTechnologies.includes(trimmed)) {
      this.selectedTechnologies.push(trimmed);
      this.customTechName = '';
    }
  }

  // SERVICES CRUD
  openAddService(): void {
    this.isEditingService = false;
    this.selectedTechnologies = [];
    this.serviceForm = {
      id: '',
      title: '',
      description: '',
      imageUrl: '',
      imageAlt: '',
      extendedInfoStr: ''
    };
    this.showServiceModal.set(true);
  }

  openEditService(service: ServiceItem): void {
    this.isEditingService = true;
    this.selectedTechnologies = [...(service.technologies || [])];
    this.serviceForm = {
      id: service.id,
      title: service.title,
      description: service.description,
      imageUrl: service.imageUrl,
      imageAlt: service.imageAlt,
      extendedInfoStr: (service.extendedInfo || []).join('\n')
    };
    this.showServiceModal.set(true);
  }

  saveService(): void {
    const serviceData = {
      title: this.serviceForm.title,
      description: this.serviceForm.description,
      imageUrl: this.serviceForm.imageUrl,
      imageAlt: this.serviceForm.imageAlt || this.serviceForm.title,
      extendedInfo: this.serviceForm.extendedInfoStr.split('\n').map(x => x.trim()).filter(x => x.length > 0),
      technologies: this.selectedTechnologies
    };

    if (this.isEditingService) {
      this.servicesService.updateService(this.serviceForm.id, serviceData, this.token()).subscribe({
        next: () => {
          this.showServiceModal.set(false);
          this.loadData();
        },
        error: (err) => this.handleActionError(err, 'actualizar servicio')
      });
    } else {
      this.servicesService.createService(serviceData, this.token()).subscribe({
        next: () => {
          this.showServiceModal.set(false);
          this.loadData();
        },
        error: (err) => this.handleActionError(err, 'crear servicio')
      });
    }
  }

  deleteService(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
      this.servicesService.deleteService(id, this.token()).subscribe({
        next: () => this.loadData(),
        error: (err) => this.handleActionError(err, 'eliminar servicio')
      });
    }
  }

  // PROJECTS CRUD
  openAddProject(): void {
    this.isEditingProject = false;
    this.selectedTechnologies = [];
    this.newProjectImageUrl = '';
    this.projectForm = {
      id: '',
      title: '',
      shortDescription: '',
      description: '',
      image: '',
      images: [],
      status: 'completado',
      githubUrl: '',
      webUrl: '',
      backendUrl: '',
      apkUrl: ''
    };
    this.showProjectModal.set(true);
  }

  openEditProject(project: Project): void {
    this.isEditingProject = true;
    this.selectedTechnologies = [...(project.technologies || [])];
    this.newProjectImageUrl = '';
    const projectImages = getProjectImages(project);
    this.projectForm = {
      id: project.id,
      title: project.title,
      shortDescription: project.shortDescription || '',
      description: project.description,
      image: projectImages[0] || project.image,
      images: [...projectImages],
      status: project.status,
      githubUrl: project.githubUrl || '',
      webUrl: project.webUrl || '',
      backendUrl: project.backendUrl || '',
      apkUrl: project.apkUrl || ''
    };
    this.showProjectModal.set(true);
  }

  saveProject(): void {
    // Allow saving if the user typed a URL without pressing "Añadir"
    if (this.newProjectImageUrl.trim()) {
      this.addProjectImageUrl();
    }

    const cleanedImages = this.projectForm.images
      .map(img => img.trim())
      .filter(img => img.length > 0);

    if (cleanedImages.length === 0) {
      alert('Debes agregar al menos una imagen para el proyecto.');
      return;
    }

    const projectData = {
      title: this.projectForm.title,
      shortDescription: this.projectForm.shortDescription,
      description: this.projectForm.description,
      image: cleanedImages[0],
      images: cleanedImages,
      technologies: this.selectedTechnologies,
      status: this.projectForm.status,
      githubUrl: this.projectForm.githubUrl || null,
      webUrl: this.projectForm.webUrl || null,
      backendUrl: this.projectForm.backendUrl || null,
      apkUrl: this.projectForm.apkUrl || null
    };

    if (this.isEditingProject) {
      this.projectsService.updateProject(this.projectForm.id, projectData, this.token()).subscribe({
        next: () => {
          this.showProjectModal.set(false);
          this.loadData();
        },
        error: (err) => this.handleActionError(err, 'actualizar proyecto')
      });
    } else {
      this.projectsService.createProject(projectData, this.token()).subscribe({
        next: () => {
          this.showProjectModal.set(false);
          this.loadData();
        },
        error: (err) => this.handleActionError(err, 'crear proyecto')
      });
    }
  }

  deleteProject(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este proyecto?')) {
      this.projectsService.deleteProject(id, this.token()).subscribe({
        next: () => this.loadData(),
        error: (err) => this.handleActionError(err, 'eliminar proyecto')
      });
    }
  }

  // CERTIFICATES CRUD
  openAddCertificate(): void {
    this.isEditingCertificate = false;
    this.selectedTechnologies = [];
    this.certificateForm = {
      id: '',
      title: '',
      issuer: '',
      issuerIcon: 'fas fa-certificate',
      date: new Date().getFullYear().toString(),
      category: 'web',
      credentialId: '',
      credentialUrl: '',
      description: '',
      hours: 0,
      image: '',
      expirationDate: 'No expira'
    };
    this.showCertificateModal.set(true);
  }

  openEditCertificate(cert: Certificate): void {
    this.isEditingCertificate = true;
    this.selectedTechnologies = [...(cert.skills || [])];
    this.certificateForm = {
      id: cert.id,
      title: cert.title,
      issuer: cert.issuer,
      issuerIcon: cert.issuerIcon || 'fas fa-certificate',
      date: cert.date,
      category: cert.category || 'web',
      credentialId: cert.credentialId,
      credentialUrl: cert.credentialUrl || '',
      description: cert.description,
      hours: cert.hours || 0,
      image: cert.image || '',
      expirationDate: cert.expirationDate || 'No expira'
    };
    this.showCertificateModal.set(true);
  }

  saveCertificate(): void {
    const certData = {
      title: this.certificateForm.title,
      issuer: this.certificateForm.issuer,
      issuerIcon: this.certificateForm.issuerIcon || 'fas fa-certificate',
      date: this.certificateForm.date,
      category: this.certificateForm.category,
      credentialId: this.certificateForm.credentialId,
      credentialUrl: this.certificateForm.credentialUrl || null,
      description: this.certificateForm.description,
      skills: this.selectedTechnologies,
      hours: Number(this.certificateForm.hours) || 0,
      image: this.certificateForm.image || null,
      expirationDate: this.certificateForm.expirationDate || null
    };

    if (this.isEditingCertificate) {
      this.certificatesService.updateCertificate(this.certificateForm.id, certData, this.token()).subscribe({
        next: () => {
          this.showCertificateModal.set(false);
          this.loadData();
        },
        error: (err) => this.handleActionError(err, 'actualizar certificado')
      });
    } else {
      this.certificatesService.createCertificate(certData, this.token()).subscribe({
        next: () => {
          this.showCertificateModal.set(false);
          this.loadData();
        },
        error: (err) => this.handleActionError(err, 'crear certificado')
      });
    }
  }

  deleteCertificate(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este certificado?')) {
      this.certificatesService.deleteCertificate(id, this.token()).subscribe({
        next: () => this.loadData(),
        error: (err) => this.handleActionError(err, 'eliminar certificado')
      });
    }
  }

  getCategoryLabel(category: string): string {
    switch (category) {
      case 'web':
        return 'Web & Frontend';
      case 'backend':
        return 'Backend & Arquitectura';
      case 'cloud':
        return 'Cloud & DevOps';
      case 'database':
        return 'Bases de Datos';
      case 'mobile':
        return 'Móvil & Otros';
      case 'security':
      case 'network':
      case 'redes':
        return 'Redes & Seguridad';
      case 'support':
      case 'helpdesk':
        return 'Soporte Técnico & Help Desk';
      case 'iot':
        return 'IoT & Redes Conectadas';
      case 'idiomas':
      case 'languages':
      case 'ingles':
        return 'Idiomas';
      default:
        return category || 'General';
    }
  }

  loadContacts(): void {
    if (!this.token()) return;
    this.contactService.getMessages(this.token()).subscribe({
      next: (data) => this.contacts.set(data),
      error: (err) => console.error('Error al cargar contactos:', err)
    });
  }

  deleteContact(id?: string): void {
    if (!id) return;
    if (confirm('¿Estás seguro de que deseas eliminar este mensaje de contacto?')) {
      this.contactService.deleteMessage(id, this.token()).subscribe({
        next: () => {
          this.contacts.set(this.contacts().filter((c) => c.id !== id));
          if (this.selectedContactMessage()?.id === id) {
            this.showContactModal.set(false);
            this.selectedContactMessage.set(null);
          }
        },
        error: (err) => this.handleActionError(err, 'eliminar mensaje de contacto')
      });
    }
  }

  openViewContact(msg: ContactMessage): void {
    this.selectedContactMessage.set(msg);
    this.showContactModal.set(true);
  }

  closeContactModal(): void {
    this.showContactModal.set(false);
    this.selectedContactMessage.set(null);
  }

  formatContactDate(dateStr?: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  }

  private handleActionError(err: any, actionName: string): void {
    if (err?.status === 401) {
      alert('Tu sesión ha expirado o las credenciales no son válidas. Por favor, vuelve a ingresar la contraseña de administrador.');
      this.onLogout();
    } else {
      alert(`Error al ${actionName}: ` + (err?.error?.message || err?.message || 'Error desconocido'));
    }
  }
}
