import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-user',
  imports: [CommonModule, FormsModule],
  templateUrl: './user.html',
  styleUrl: './user.css',
})
export class UserComponent implements OnInit, OnDestroy {
  users: User[] = [];
  loading = false;
  error: string | null = null;
  countdown = '';
  intervalId: any;
  remaining: string | null = null;

  form: { name: string; email: string } = { name: '', email: '' };
  activeUserId: number | null = null;
  formError: string | null = null;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.fetchUsers();
    this.startCountdown();
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  fetchUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (list) => {
        this.users = list ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toastService.show(err?.message ?? 'Unable to load users', 'error');
      },
    });
  }

  submit(): void {
    if (!this.form.name || !this.form.email) {
      this.toastService.show('Name and email are required', 'error');
      return;
    }

    this.formError = null;

    const request = this.activeUserId
      ? this.userService.updateUser(this.activeUserId, this.form)
      : this.userService.createUser(this.form);

    request.subscribe({
      next: () => {
        this.toastService.show(this.activeUserId ? 'User updated successfully' : 'User created successfully', 'success');
        this.fetchUsers();  // Refresh full user list
        this.resetForm();   // Clear form
      },
      error: (err) => {
        this.toastService.show(err?.message ?? 'Something went wrong', 'error');
      }
    });
  }


  edit(user: User): void {
    this.activeUserId = user.id ?? null;
    this.form = { name: user.name, email: user.email };
  }

  resetForm(): void {
    this.activeUserId = null;
    this.form = { name: '', email: '' };
    this.formError = null;
  }

  delete(id: number): void {
    this.userService.deleteById(id).subscribe({
      next: () => {
        this.users = this.users.filter((u) => u.id !== id);
        this.toastService.show('User deleted successfully', 'success');
      },
      error: (err) => {
        this.toastService.show(err?.message ?? 'Delete failed', 'error');
      },
    });
  }

  startCountdown(): void {
    this.updateCountdown();
    this.intervalId = setInterval(() => this.updateCountdown(), 1000);
  }

  updateCountdown(): void {
    const time = this.authService.getTokenExpiryTime();
    if (time == null) return;

    const m = Math.floor(time / 60000);
    const s = Math.floor((time % 60000) / 1000);
    this.countdown = `${m}m ${s}s`;

    if (time <= 0) {
      clearInterval(this.intervalId);
      this.countdown = 'Expired';
      this.authService.logout();
    }
  }
}
