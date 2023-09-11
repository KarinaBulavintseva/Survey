import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {
  AbstractControl,
  ValidationErrors,
  AsyncValidatorFn,
  FormArray,
  FormGroup,
  NgForm,
} from '@angular/forms';
import { Observable, map, Subscription } from 'rxjs';
import { EmailValidationService } from '../../services/email-validation.service';
import { MAX_HOBBIES_LENGTH } from '../../constants/index';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})
export class FormComponent implements OnInit, OnDestroy {
  private subscription$ = new Subscription();

  @ViewChild('formDirective') formDirective!: NgForm;

  frameworks = ['angular', 'react', 'vue'];

  versions = {
    angular: ['1.1.1', '1.2.1', '1.3.3'],
    react: ['2.1.2', '3.2.4', '4.3.1'],
    vue: ['3.3.1', '5.2.1', '5.1.3'],
  };

  frameworkVersions: string[] = [];

  isHobbiesArrayHasMaxLength = false;

  surveyForm = this.fb.group({
    username: ['', Validators.required],
    surname: ['', Validators.required],
    birthdate: [null, Validators.required],
    framework: [null, Validators.required],
    version: [{ value: null, disabled: true }, Validators.required],
    email: [
      '',
      [Validators.required, Validators.email],
      this.emailAsyncValidator(this.emailValidationService),
    ],
    hobby: this.fb.array([
      this.fb.group({
        name: ['', Validators.required],
        duration: ['', Validators.required],
      }),
    ]),
  });

  constructor(
    private fb: FormBuilder,
    private emailValidationService: EmailValidationService
  ) {}

  ngOnInit(): void {
    this.subscription$.add(
      this.surveyForm.get('framework')?.valueChanges.subscribe((framework) => {
        const frameworkVersion = this.surveyForm.get('version');
        if (framework) {
          frameworkVersion!.reset();
          frameworkVersion!.enable();
          this.frameworkVersions = this.versions[framework];
        } else {
          frameworkVersion!.disable();
        }
      })
    );
  }

  hobby(): FormArray {
    return this.surveyForm.get('hobby') as FormArray;
  }

  newHobby(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      duration: ['', Validators.required],
    });
  }

  onAddHobby() {
    if (this.hobby().length === MAX_HOBBIES_LENGTH) return;
    if (this.hobby().length + 1 === MAX_HOBBIES_LENGTH) {
      this.isHobbiesArrayHasMaxLength = true;
    }
    this.hobby().push(this.newHobby());
  }

  removeHobby(index: number) {
    this.hobby().removeAt(index);
    this.isHobbiesArrayHasMaxLength = false;
  }

  transformDate(date: Date): string {
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  emailAsyncValidator(userService: EmailValidationService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return userService.checkIfUserEmailExists(control.value).pipe(
        map((result: boolean) => {
          return result ? { userEmailAlreadyExists: true } : null;
        })
      );
    };
  }

  onSubmit() {
    if (!this.surveyForm.valid) {
      return;
    }

    const formData = this.surveyForm.value;

    let dateOfBirth;
    if (formData.birthdate) {
      dateOfBirth = this.transformDate(formData.birthdate);
    }

    const userData = {
      firstName: formData.username,
      lastName: formData.surname,
      dateOfBirth,
      framework: formData.framework,
      frameworkVersion: formData.version,
      email: formData.email,
      hobby: formData.hobby,
    };

    this.formDirective.resetForm();
  }

  ngOnDestroy(): void {
    this.subscription$.unsubscribe();
  }
}
