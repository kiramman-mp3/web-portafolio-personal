import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { ContactComponent } from './components/contact/contact.component';
import { ServiciosComponent } from './pages/servicios/servicios.component';
import { ProyectosComponent } from './pages/proyectos/proyectos.component';
import { ProyectoDetalleComponent } from './pages/proyecto-detalle/proyecto-detalle.component';
import { CertificadosComponent } from './pages/certificados/certificados.component';
import { AdminComponent } from './pages/admin/admin.component';

// Páginas públicas; se sirven en español en "/" y en inglés bajo "/en".
// `page` elige el título y la descripción de copy.ts (el detalle de proyecto pone los suyos).
const pages: Routes = [
  { path: '', component: Home, data: { page: 'home' } },
  { path: 'contacto', component: ContactComponent, data: { page: 'contact' } },
  { path: 'servicios', component: ServiciosComponent, data: { page: 'services' } },
  { path: 'proyectos', component: ProyectosComponent, data: { page: 'projects' } },
  { path: 'proyectos/:id', component: ProyectoDetalleComponent },
  { path: 'educacion', component: CertificadosComponent, data: { page: 'education' } },
  // La página se llamaba Certificados; el enlace viejo sigue funcionando
  { path: 'certificados', redirectTo: 'educacion', pathMatch: 'full' }
];

export const routes: Routes = [
  { path: 'en', children: pages },
  ...pages,
  { path: 'admin', component: AdminComponent }
];
