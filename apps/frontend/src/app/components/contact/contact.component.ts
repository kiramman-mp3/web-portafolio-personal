import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService, ContactMessage } from '../../shared/services/contact.service';
import { FooterComponent } from '../footer/footer.component';
import { I18nService } from '../../shared/i18n/i18n.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  readonly i18n = inject(I18nService);
  formData: ContactMessage = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private contactService: ContactService,
    private cdr: ChangeDetectorRef
  ) {}

  onSubmit(): void {
    if (!this.formData.name || !this.formData.email || !this.formData.message) {
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.contactService.sendMessage(this.formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = this.i18n.copy().contact.ok;
        // Reset form
        this.formData = {
          name: '',
          email: '',
          subject: '',
          message: ''
        };
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error sending message:', error);
        this.errorMessage = this.i18n.copy().contact.fail;
        this.cdr.detectChanges();
      }
    });
  }
}
