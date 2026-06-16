import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HomeComponent } from './pages/home/home.component';
import { LogComponent } from './pages/log/log.component';
import { EntryDetailComponent } from './pages/log/entry-detail/entry-detail.component';
import { EntryFormComponent } from './pages/log/entry-form/entry-form.component';
import { authGuard } from './core/guards/auth.guard';



export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'log',
    component: LogComponent,
    canActivate: [authGuard]
  },
  {
    path: 'log/new',
    component: EntryFormComponent,
    canActivate: [authGuard]
  },
  {
    path: 'bodyweight',
    loadComponent: () =>
      import('./pages/bodyweight/bodyweight.component').then(m => m.BodyweightComponent),
    canActivate: [authGuard]
  },
  {
    path: 'log/workout/:id',
    component: EntryDetailComponent,
    canActivate: [authGuard],
    data: { kind: 'workout' }
  },
  {
    path: 'log/rest/:id',
    component: EntryDetailComponent,
    canActivate: [authGuard],
    data: { kind: 'rest' }
  },
  {
    path: 'home',
    component: HomeComponent,

  }

];
