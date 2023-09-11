import { Injectable } from '@angular/core';
import { delay, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmailValidationService {
  private existingEmails = ['test@test.test'];

  checkIfUserEmailExists(enteredEmailAddress: string) {
    return of(
      this.existingEmails.some((email) => email === enteredEmailAddress)
    ).pipe(delay(2000));
  }
}
