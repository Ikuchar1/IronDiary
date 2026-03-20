import { Component } from '@angular/core';
import { MatToolbarModule, MatToolbar } from '@angular/material/toolbar';
import { AuthService } from '../../../core/services/auth.service';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-footer',
  imports: [MatToolbarModule, MatButtonModule],
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {


}
